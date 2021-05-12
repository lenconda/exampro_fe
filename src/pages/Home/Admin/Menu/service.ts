import { MenuRolePaginationData } from '.';
import AppRequestManager from '../../../../components/AppRequest/Manager';
import {
  MenuItemRequestData,
  MenuItemResponseData,
  MenuRoleResponseData,
  MenuTreeItemLevelPermission,
  MenuTreeItemMetadata,
} from '../../../../interfaces';
import {
  pipeMenusResponseToFlattenedTree,
  pipeMenusResponseToTree,
} from '../../../../utils/pipes';
import { requestWithQueries } from '../../../../utils/request';
import _ from 'lodash';

export const getAllMenus = async () => {
  const data = await AppRequestManager.send({
    url: '/admin/menu',
  });
  return (_.get(data, 'data.data.items') || []) as MenuItemResponseData[];
};

export const getMenuTree = async () => {
  const menuItems = await getAllMenus();
  return pipeMenusResponseToTree(menuItems);
};

export const getFlattenedMenuTree = async () => {
  return pipeMenusResponseToFlattenedTree(await getMenuTree());
};

export const createMenu = async (menuItemData: MenuItemRequestData) => {
  await AppRequestManager.send({
    url: '/admin/menu',
    method: 'POST',
    data: menuItemData,
    handleError: false,
  });
  return;
};

export const updateMenuItem = async (menuId: number, updates: Partial<MenuItemRequestData>) => {
  await AppRequestManager.send({
    url: `/admin/menu/${menuId}`,
    method: 'PATCH',
    data: updates,
  });
  return;
};

export const batchUpdateMenuItems = async (menuItems: MenuTreeItemMetadata[]) => {
  const updateItems = Array.from(menuItems).map((item, index) => {
    let parent: number = null;
    if (item.level > 0) {
      const previousLevelTreeItems = menuItems.filter((currentItem, findItemIndex) => {
        return currentItem.level === item.level - 1 && findItemIndex < index;
      });
      parent = _.get(_.last(previousLevelTreeItems), 'id');
    }
    return {
      ..._.pick(item, ['id', 'title', 'pathname', 'order', 'icon']),
      ...(_.isNumber(parent) ? { parent } : {}),
    } as MenuItemRequestData & { id: number };
  });
  const requests = updateItems.map((item) => updateMenuItem(item.id, _.omit(item, ['id'])));
  if (requests.length) {
    await Promise.all(requests);
  }
};

export const deleteMenuItems = async (menuItemId: number) => {
  await AppRequestManager.send({
    url: `/admin/menu/${menuItemId}`,
    method: 'DELETE',
  });
  return;
};

export const queryMenuRoles = async (menuId: number, queries: MenuRolePaginationData) => {
  const data = await requestWithQueries<MenuRoleResponseData>(`/admin/menu/${menuId}/role`, queries);
  return data;
};

export const deleteMenuRoles = async (menuIds: number[], roleIds: string[]) => {
  const data = await AppRequestManager.send({
    url: '/admin/role/menu',
    method: 'DELETE',
    data: {
      menus: menuIds,
      roles: roleIds,
    },
  });
  return data;
};

export const getMoveLevelDirectionPermission = (
  menuTreeItems: MenuTreeItemMetadata[],
  currentMenuTreeItemIndex: number,
): MenuTreeItemLevelPermission => {
  const currentTreeItems = Array.from(menuTreeItems);
  const currentTreeItem = currentTreeItems[currentMenuTreeItemIndex];
  const result: MenuTreeItemLevelPermission = {
    left: false,
    right: false,
  };
  if (!currentTreeItem) {
    return result;
  }
  const { level: currentLevel } = currentTreeItem;
  const previousTreeItem = currentTreeItems[currentMenuTreeItemIndex - 1];
  if (!previousTreeItem) {
    if (currentLevel > 0) {
      result.left = true;
      result.right = false;
    } else {
      return result;
    }
  } else {
    const { level: previousLevel } = previousTreeItem;
    result.left = currentLevel !== 0;
    if (previousLevel === currentLevel) {
      result.right = true;
    } else if (previousLevel > currentLevel) {
      result.right = true;
    } else if (previousLevel < currentLevel) {
      result.right = false;
    }
  }
  return result;
};

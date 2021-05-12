import AppRequestManager from '../../../../components/AppRequest/Manager';
import {
  MenuItemRequestData,
  MenuItemResponseData,
  MenuTreeItemMetadata,
} from '../../../../interfaces';
import {
  pipeMenusResponseToFlattenedTree,
  pipeMenusResponseToTree,
} from '../../../../utils/pipes';
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

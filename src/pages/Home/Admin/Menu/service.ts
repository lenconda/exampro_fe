import AppRequestManager from '../../../../components/AppRequest/Manager';
import { MenuItemResponseData } from '../../../../interfaces';
import { pipeMenusResponseToTree } from '../../../../utils/pipes';
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

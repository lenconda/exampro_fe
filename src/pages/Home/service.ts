import _ from 'lodash';
import AppRequestManager from '../../components/AppRequest/Manager';
import { SidebarMenuItem } from '../../interfaces';

export const getUserProfile = async () => {
  const data = await AppRequestManager.send({
    url: '/user/profile',
  });
  return _.get(data, 'data.data');
};

export const getSidebarMenu = async (
  sidebarMenuTexts: Record<string, string>,
): Promise<SidebarMenuItem[]> => {
  if (!sidebarMenuTexts) {
    return null;
  }
  const data = await AppRequestManager.send({
    url: '/menu',
  });
  const items = (_.get(data, 'data.data') || []) as SidebarMenuItem[];
  const recurse = (items: SidebarMenuItem[], parentTitle = ''): SidebarMenuItem[] => {
    const result = [];
    for (const item of items) {
      const currentTitle = `${parentTitle}${item.title}`;
      const { items: currentItems = [] } = item;
      const resultItem: SidebarMenuItem = {
        ..._.omit(item, ['items']),
        title: sidebarMenuTexts[currentTitle],
        items: currentItems.length > 0 ? recurse(currentItems, `${currentTitle}/`) : [],
      };
      result.push(resultItem);
    }
    return result;
  };
  return recurse(items);
};

export const logout = async (redirect: string): Promise<string> => {
  const data = await AppRequestManager.send({
    url: '/auth/logout',
    method: 'POST',
    data: { redirect },
  });
  return _.get(data, 'data.data.redirect');
};

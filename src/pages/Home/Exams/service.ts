import _ from 'lodash';
import AppRequestManager from '../../../components/AppRequest/Manager';
import { ExamRole } from '../../../interfaces';

export const getExamRoleTypes = async (roleTexts: Record<string, string>) => {
  const data = await AppRequestManager.send({
    url: '/exam/roles',
  });

  const items = (_.get(data, 'data.data.items') || []) as ExamRole[];
  return items.map((item) => ({
    ...item,
    description: roleTexts[item.id],
  }));
};

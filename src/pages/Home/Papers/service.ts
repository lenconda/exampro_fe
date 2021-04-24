import AppRequestManager from '../../../components/AppRequest/Manager';
import _ from 'lodash';

export const queryPapers = async (search: string) => {
  const data = await AppRequestManager.send({
    url: `/paper?${search}`,
  });

  return _.get(data, 'data.data');
};

export const deletePapers = async (paperIds: number[]) => {
  const data = await AppRequestManager.send({
    url: '/paper',
    method: 'DELETE',
    data: {
      papers: paperIds,
    },
  });
  return _.get(data, 'data.data');
};

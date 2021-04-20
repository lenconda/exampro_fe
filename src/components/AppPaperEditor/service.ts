import AppRequestManager from '../AppRequest/Manager';
import { AppQuestionMetaData } from '../AppQuestionEditor';
import { QuestionResponseData } from '../../interfaces';
import { pipeQuestionResponseToMetadata } from '../../utils/pipes';
import _ from 'lodash';

export const queryAllQuestions = async (search: string): Promise<AppQuestionMetaData[]> => {
  const data = await AppRequestManager.send({
    url: `/question?${search ? `search=${search}&size=-1` : 'size=-1'}`,
  });

  const items = (_.get(data, 'data.data.items') || []) as QuestionResponseData[];
  return items.map((item) => pipeQuestionResponseToMetadata(item));
};

export const getPaperQuestions = async (paperId: number): Promise<AppQuestionMetaData[]> => {
  const data = await AppRequestManager.send({
    url: `/paper/${paperId}/questions`,
  });

  const items = (_.get(data, 'data.data.items') || []) as QuestionResponseData[];
  return items.map((item) => pipeQuestionResponseToMetadata(item));
};

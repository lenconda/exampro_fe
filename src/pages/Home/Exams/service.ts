import AppRequestManager from '../../../components/AppRequest/Manager';
import { Exam, ExamRole, ExamStatus } from '../../../interfaces';
import _ from 'lodash';

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

export const queryExams = async (search) => {
  const data = await AppRequestManager.send({
    url: `/exam?${search}`,
  });

  return _.get(data, 'data.data');
};

export const deleteExams = async (exams: Exam[]) => {
  const data = await AppRequestManager.send({
    url: '/exam',
    method: 'DELETE',
    data: {
      exams: exams.map((exam) => exam.id),
    },
  });
  return data;
};

export const getExamStatus = (exam: Exam): ExamStatus => {
  const { startTime, endTime, resultTime } = exam;
  const now = Date.now();
  const endTimestamp = Date.parse(endTime);
  const resultTimestamp = Date.parse(resultTime);
  if (now > resultTimestamp) {
    return 'RESULTED';
  }
  if (!startTime) {
    if (now < endTimestamp) {
      return 'IN_PROGRESS';
    } else {
      return 'FINISHED';
    }
  } else {
    const startTimestamp = Date.parse(startTime);
    if (now < startTimestamp) {
      return 'PREPARING';
    } else if (now >= startTimestamp && now <= endTimestamp) {
      return 'IN_PROGRESS';
    } else if (now > endTimestamp) {
      return 'FINISHED';
    }
  }
};

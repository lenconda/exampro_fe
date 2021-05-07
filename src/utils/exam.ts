import { ExamResponseData, ExamResultMetadata, ExamResultResponseData } from '../interfaces';
import _ from 'lodash';

export const checkExamParticipantScoresStatus = (result: ExamResultResponseData): boolean => {
  for (const questionIdString of Object.keys(result)) {
    const { scores } = result[questionIdString];
    if (!_.isNumber(scores)) {
      return false;
    }
  }
  return true;
};

export const calculateExamParticipantTotalScore = (result: ExamResultResponseData): ExamResultMetadata => {
  const { totalPoints, totalScore } = Object.keys(result).reduce((accumulator, currentQuestionId) => {
    const {
      totalPoints: previousTotalPoints,
      totalScore: previousTotalScore,
    } = accumulator;
    const {
      scores: currentScore,
      points: currentPoints,
    } = result[currentQuestionId];
    return {
      totalPoints: previousTotalPoints + currentPoints,
      totalScore: _.isNumber(currentScore) && _.isNumber(previousTotalScore)
        ? previousTotalScore + currentScore
        : null,
    } as Partial<ExamResultMetadata>;
  }, {
    totalPoints: 0,
    totalScore: 0,
    percentage: null,
  } as Partial<ExamResultMetadata>);

  return {
    totalPoints,
    totalScore,
    percentage: _.isNumber(totalScore) ? ((totalScore / totalPoints) * 100).toFixed(2) : null,
  };
};

export const checkParticipantQualification = (exam: ExamResponseData) => {
  if (!exam) {
    console.log('NO EXAM');
    return false;
  }
  const { userExam, startTime, endTime } = exam;
  if (!userExam) {
    console.log('NO USER_EXAM');
    return false;
  }
  if (userExam.submitTime) {
    return false;
  }
  const startTimestamp = Date.parse(startTime);
  const endTimestamp = Date.parse(endTime);
  const currentTimestamp = Date.now();
  if (!(startTimestamp <= currentTimestamp && currentTimestamp <= endTimestamp)) {
    return false;
  }
  return true;
};

export const checkReviewPermission = (exam: ExamResponseData) => {
  const { endTime } = exam;
  const endTimestamp = Date.parse(endTime);
  if (endTimestamp <= Date.now()) {
    return true;
  } else { return false }
};

export const checkResultPermission = checkReviewPermission;

import { ExamResponseData, ExamResultMetadata, ExamResultResponseData, UserExam } from '../interfaces';
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

export const calculateExamParticipantTotalScore = (result: ExamResultResponseData, userExam: UserExam): ExamResultMetadata => {
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

  if (userExam && userExam.fraud) {
    return {
      totalPoints,
      totalScore: 0,
      percentage: '0',
    };
  }

  let percentage = '0';

  if (!_.isNumber(totalScore)) {
    percentage = null;
  } else if (totalPoints === 0) {
    percentage = '0';
  } else {
    percentage = ((totalScore / totalPoints) * 100).toFixed(2);
  }

  return {
    totalPoints,
    totalScore,
    percentage,
  };
};

export const checkParticipantQualification = (exam: ExamResponseData) => {
  if (!window.navigator || !window.navigator.mediaDevices) {
    return false;
  }
  const { getUserMedia, getDisplayMedia } = (window.navigator.mediaDevices as any);

  if (!_.isFunction(getUserMedia) || !_.isFunction(getDisplayMedia)) {
    return false;
  }

  if (!exam) {
    return false;
  }
  const { userExam, startTime, endTime } = exam;
  if (!userExam) {
    return false;
  }
  if (userExam.submitTime) {
    return false;
  }
  const startTimestamp = Date.parse(startTime);
  const endTimestamp = Date.parse(endTime);
  const currentTimestamp = Date.now();
  if (!(startTimestamp <= currentTimestamp && currentTimestamp <= endTimestamp + 10000)) {
    return false;
  }
  return true;
};

export const checkReviewPermission = (exam: ExamResponseData) => {
  if (!exam) {
    return false;
  }
  if (!exam.userExam) {
    return false;
  }
  const { resultTime, startTime } = exam;
  if (!resultTime) {
    return false;
  }
  const resultTimestamp = Date.parse(resultTime);
  const currentTimestamp = Date.now();
  if (startTime && Date.parse(startTime) > currentTimestamp) {
    return false;
  }
  if (resultTimestamp < currentTimestamp) {
    return false;
  }
  return true;
};

export const checkReviewResultPermission = (exam: ExamResponseData) => {
  if (!exam) {
    return false;
  }
  if (!exam.userExam) {
    return false;
  }
  const { resultTime } = exam;
  const resultTimestamp = Date.parse(resultTime);
  const currentTimestamp = Date.now();

  if (currentTimestamp > resultTimestamp) {
    return true;
  } else {
    return false;
  }
};

export const checkResultPermission = (exam: ExamResponseData) => {
  if (!exam) {
    return false;
  }
  const { resultTime, startTime } = exam;
  if (!resultTime) {
    return false;
  }
  const resultTimestamp = Date.parse(resultTime);
  const currentTimestamp = Date.now();
  if (startTime && Date.parse(startTime) > currentTimestamp) {
    return false;
  }
  if (resultTimestamp > currentTimestamp) {
    return false;
  }
  return true;
};

export const checkInvigilatePermission = (exam: ExamResponseData) => {
  if (!exam) {
    return false;
  }
  if (!exam.userExam) {
    return false;
  }
  const { startTime } = exam;
  const startTimestamp = Date.parse(startTime);
  const currentTimestamp = Date.now();
  if (currentTimestamp > startTimestamp) {
    return true;
  } else {
    return false;
  }
};

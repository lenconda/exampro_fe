import { ExamResultMetadata, ExamResultResponseData } from '../interfaces';
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

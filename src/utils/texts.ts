import _ from 'lodash';
import { useEffect, useState } from 'react';
import { AnyAction, Dispatch } from 'redux';

export const usePageTexts = (
  dispatch: Dispatch<AnyAction>,
  pathname: string,
) => {
  const [texts, setTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.resolve(dispatch({
      type: 'app/getTexts',
    })).then((res) => {
      return _.get(res, `ui.${pathname}`);
    }).then((res) => {
      if (res) {
        setTexts(res);
      }
    });
  }, []);

  return texts;
};

export const useTexts = (dispatch: Dispatch<AnyAction>, key: string) => {
  const [texts, setTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.resolve(dispatch({
      type: 'app/getTexts',
    })).then((res) => {
      const errorTexts = _.get(res, key);
      if (errorTexts) {
        setTexts(errorTexts);
      }
    });
  }, []);

  return texts;
};

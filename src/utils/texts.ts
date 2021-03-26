import _ from 'lodash';
import { useEffect, useState } from 'react';
import { AnyAction, Dispatch } from 'redux';

export const getPageTexts = async (
  dispatch: Dispatch<AnyAction>,
  pathname: string,
): Promise<Record<string, string>> => {
  const result = await Promise.resolve(dispatch({
    type: 'app/getTexts',
  }));
  return _.get(result, `ui.${pathname}`) || {};
};

export const usePageTexts = (
  dispatch: Dispatch<AnyAction>,
  pathname: string,
) => {
  const [texts, setTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    getPageTexts(dispatch, pathname).then((res) => {
      if (res) {
        setTexts(res);
      }
    });
  }, []);

  return texts;
};

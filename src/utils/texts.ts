import _ from 'lodash';
import { useEffect, useState } from 'react';
import { AnyAction, Dispatch } from 'redux';
import { EventEmitter } from 'events';

export const useTexts = (dispatch: Dispatch<AnyAction>, key: string) => {
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [emitter, setEmitter] = useState<EventEmitter>(null);

  const handler = () => {
    Promise.resolve(dispatch({
      type: 'app/getTexts',
    })).then((res) => {
      const errorTexts = _.get(res, key);
      if (!_.isEmpty(errorTexts)) {
        setTexts(errorTexts);
      }
    });
  };

  useEffect(() => {
    Promise.resolve(dispatch({
      type: 'app/getEventEmitter',
    }) as any).then((currentEmitter) => {
      setEmitter(currentEmitter);
    });
  }, []);

  useEffect(() => {
    handler();
  }, []);

  useEffect(() => {
    if (emitter && emitter instanceof EventEmitter) {
      emitter.on('i18n_updated', handler);
    }

    return () => {
      if (emitter && emitter instanceof EventEmitter) {
        emitter.off('i18n_updated', handler);
      }
    };
  }, [emitter]);

  return texts;
};

export const usePageTexts = (
  dispatch: Dispatch<AnyAction>,
  pathname: string,
) => {
  const [texts, setTexts] = useState<Record<string, string>>({});
  const currentUITexts = useTexts(dispatch, 'ui') as Record<string, any>;

  useEffect(() => {
    Promise.resolve(dispatch({
      type: 'app/getTexts',
    })).then((res) => {
      return _.get(res, `ui.${pathname}`);
    }).then((res) => {
      if (!_.isEmpty(res)) {
        setTexts(res);
      }
    });
  }, []);

  useEffect(() => {
    const currentPageTexts = _.get(currentUITexts, pathname);
    if (!_.isEmpty(currentPageTexts)) {
      setTexts(_.get(currentUITexts, pathname));
    }
  }, [currentUITexts]);

  return texts;
};

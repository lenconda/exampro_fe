import { Listener, Location } from 'history';
import _ from 'lodash';

export const patchedHistoryListener = (func: (location: Location) => void): Listener<object> => {
  return (update) => {
    const location = update as any;
    func.call(this, location);
  };
};

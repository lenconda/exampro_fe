import { EventEmitter } from 'events';
import { SnackbarProps } from '@material-ui/core/Snackbar';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

const Constants = {
  REQUEST: 'request',
};

class Manager extends EventEmitter {
  public async send(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      this.emit(Constants.REQUEST, {
        ...config,
        cb: (data, error) => {
          if (error) { reject(error) }
          else { resolve(data) }
        },
      });
    });
  }

  public emitChange(props: SnackbarProps) {
    this.emit(Constants.REQUEST, props);
  }

  public addChangeListener(callback) {
    this.addListener(Constants.REQUEST, callback);
  }

  public removeChangeListener(callback) {
    this.removeListener(Constants.REQUEST, callback);
  }
}

export default new Manager();

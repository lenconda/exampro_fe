import { EventEmitter } from 'events';
import { SnackbarProps } from '@material-ui/core/Snackbar';

const Constants = {
  CHANGE: 'change',
};

class Manager extends EventEmitter {
  private alerts: SnackbarProps[] = [];

  constructor() {
    super();
    this.alerts = [];
  }

  public create(message: string, props: SnackbarProps) {
    this.alerts.push({
      message,
      ...props,
    });
    this.emitChange();
  }

  public emitChange() {
    this.emit(Constants.CHANGE, this.alerts);
  }

  public addChangeListener(callback) {
    this.addListener(Constants.CHANGE, callback);
  }

  public removeChangeListener(callback) {
    this.removeListener(Constants.CHANGE, callback);
  }
}

export default new Manager();

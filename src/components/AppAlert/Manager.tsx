import { EventEmitter } from 'events';
import { SnackbarProps } from '@material-ui/core/Snackbar';

const Constants = {
  CHANGE: 'change',
};

class Manager extends EventEmitter {
  public create(message: string, props: SnackbarProps) {
    this.emitChange({ message, ...props });
  }

  public emitChange(props: SnackbarProps) {
    this.emit(Constants.CHANGE, props);
  }

  public addChangeListener(callback) {
    this.addListener(Constants.CHANGE, callback);
  }

  public removeChangeListener(callback) {
    this.removeListener(Constants.CHANGE, callback);
  }
}

export default new Manager();

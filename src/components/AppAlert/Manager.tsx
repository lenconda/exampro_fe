import { OptionsObject } from 'notistack';
import { EventEmitter } from 'events';

const Constants = {
  CHANGE: 'change',
};

class Manager extends EventEmitter {
  public create(message: string, props: OptionsObject) {
    this.emitChange({ message, ...props });
  }

  public emitChange(props: OptionsObject & { message: string }) {
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

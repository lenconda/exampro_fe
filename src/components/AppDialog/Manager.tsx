import { DialogProps } from '@material-ui/core/Dialog';
import { EventEmitter } from 'events';

export const Constants = {
  INFO: 'APP_DIALOG_INFO',
  CONFIRM: 'APP_DIALOG_CONFIRM',
};

const APP_DIALOG = 'APP_DIALOG';

export type AppDialogType = keyof typeof Constants;
export type AppContentType = React.ReactText | React.ReactNode;

export interface AppConfirmDialogProps extends Omit<DialogProps, 'open'> {
  open?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface AppInfoDialogProps extends Omit<DialogProps, 'open'> {
  open?: boolean;
}

export type AppDialogProps = AppConfirmDialogProps | AppInfoDialogProps;

export interface AppDialogEmitType {
  content?: AppContentType;
  props?: AppConfirmDialogProps | AppInfoDialogProps;
  type: AppDialogType;
}

class Manager extends EventEmitter {
  public info(content: AppContentType, props: AppDialogProps = {}) {
    this.emitChange(Constants.INFO, content, props);
  }

  public confirm(content: AppContentType, props: AppDialogProps = {}) {
    this.emitChange(Constants.CONFIRM, content, props);
  }

  public addChangeListener(callback) {
    this.addListener(APP_DIALOG, callback);
  }

  public removeChangeListener(callback) {
    this.removeListener(APP_DIALOG, callback);
  }

  private emitChange(
    type: string,
    content: AppContentType,
    props: AppDialogProps,
  ) {
    this.emit(APP_DIALOG, { content, type, props });
  }
}

export default new Manager();

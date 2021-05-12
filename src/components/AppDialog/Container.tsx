import AppDialogManager, { AppConfirmDialogProps, AppDialogEmitType, AppInfoDialogProps, Constants } from './Manager';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import { Dispatch } from '../../interfaces';
import { useTexts } from '../../utils/texts';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

export interface AppDialogContainerProps extends AppState, Dispatch {}

const Container: React.FC<AppDialogContainerProps> = ({
  dispatch,
}) => {
  const dialogTexts = useTexts(dispatch, 'dialog');
  const systemTexts = useTexts(dispatch, 'system');
  const [dialogs, setDialogs] = useState<AppDialogEmitType[]>([]);

  const closeDialog = (index) => {
    const currentDialog = _.merge(dialogs[index], {
      props: { open: false } as DialogProps,
    });
    const currentDialogs = Array.from(dialogs);
    currentDialogs.splice(index, 1, currentDialog);
    setDialogs(currentDialogs);
  };

  const handleClose = (event, reason, index, onClose) => {
    closeDialog(index);
    if (_.isFunction(onClose)) {
      onClose(event, reason);
    }
  };

  const handleAction = (index: number, handler: Function) => {
    closeDialog(index);
    if (_.isFunction(handler)) {
      handler();
    }
  };

  useEffect(() => {
    const handler = (data: AppDialogEmitType) => {
      setDialogs(dialogs.concat(_.merge(data, {
        props: {
          open: true,
        } as DialogProps,
      })));
    };
    AppDialogManager.addChangeListener(handler);
    return () => {
      AppDialogManager.removeChangeListener(handler);
    };
  }, []);

  return (
    <>
      {
        dialogs.map((dialog, index) => {
          const { content, type, props } = dialog;
          const { open = true, onClose } = props;
          const { onConfirm, onCancel } = props as AppConfirmDialogProps;
          return (
            <Dialog
              key={index}
              open={open}
              {..._.omit(props, ['onConfirm'])}
              onClose={(event, reason) => {
                if (reason === 'escapeKeyDown') {
                  return false;
                }
                handleClose(event, reason, index, onClose);
              }}
            >
              <DialogTitle>{dialogTexts['PROMPT']}</DialogTitle>
              <DialogContent>{content}</DialogContent>
              {
                type === Constants.CONFIRM && (
                  <DialogActions>
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => {
                        handleAction(index, onCancel);
                      }}
                    >{systemTexts['CANCEL']}</Button>
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => {
                        handleAction(index, onConfirm);
                      }}
                    >{systemTexts['OK']}</Button>
                  </DialogActions>
                )
              }
            </Dialog>
          );
        })
      }
    </>
  );
};

export default connect(({ app }: ConnectState) => app)(Container);

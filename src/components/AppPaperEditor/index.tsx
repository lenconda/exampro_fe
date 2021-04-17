import { AppState } from '../../models/app';
import { Dispatch } from '../../interfaces';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { useTexts } from '../../utils/texts';
import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
// import { Field, Form as FormikForm, Formik } from 'formik';

// const Form = FormikForm as any;

export interface AppPaperEditorProps extends DialogProps {}
export interface AppPaperEditorComponentProps extends AppState, Dispatch, AppPaperEditorProps {}

const tabs = ['BASE_SETTINGS', 'QUESTIONS', 'MAINTAINER'];

const AppPaperEditor: React.FC<AppPaperEditorComponentProps> = ({
  dispatch,
  ...props
}) => {
  const texts = useTexts(dispatch, 'paperEditor');
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

  return (
    <>
      <Dialog {...props} scroll="paper" maxWidth="sm" fullWidth={true}>
        <DialogTitle>
          {texts['TITLE']}
          <Box>
            <Tabs
              value={selectedTabIndex}
              variant="scrollable"
              indicatorColor="primary"
              textColor="primary"
            >
              {
                tabs.map((tab, index) => {
                  return (
                    <Tab
                      key={index}
                      label={texts[tab]}
                      onClick={() => setSelectedTabIndex(index)}
                    />
                  );
                })
              }
            </Tabs>
          </Box>
        </DialogTitle>
        <DialogContent>
          {
            tabs[selectedTabIndex] === 'BASE_SETTINGS' && (
              <TextField label={texts['ENTER_TITLE']} fullWidth={true} />
            )
          }
        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
    </>
  );
};

export default connect(({ app }: ConnectState) => app)(AppPaperEditor) as React.FC<AppPaperEditorProps>;

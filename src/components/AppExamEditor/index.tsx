import { getExamUsers } from './service';
import { AppState } from '../../models/app';
import {
  Dispatch,
  ExamResponseData,
  PaperResponseData,
  User,
} from '../../interfaces';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { useTexts } from '../../utils/texts';
import Input from '../AppSearchBar/Input';
import { useDebouncedValue } from '../../utils/hooks';
import AppUserItem from '../AppUserItem';
import { queryAllUsers } from '../../service';
import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';
import DeleteIcon from '@material-ui/icons/Delete';
import FileQuestionIcon from 'mdi-material-ui/FileQuestion';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';

export interface AppExamEditorProps extends DialogProps {
  mode?: 'create' | 'edit';
  exam?: ExamResponseData;
  roleId?: string;
  onSubmitExam?(): void;
}

export interface AppExamEditorComponentProps extends AppState, Dispatch, AppExamEditorProps {}

interface TypedUsers {
  [key: string]: User[];
}

const useStyles = makeStyles((theme) => {
  return {
    searchWrapper: {
      display: 'flex',
      alignItems: 'stretch',
      marginTop: theme.spacing(2),
      '& button': {
        marginLeft: theme.spacing(2),
      },
    },
    buttonsWrapper: {
      marginTop: theme.spacing(2),
      display: 'flex',
      overflowX: 'scroll',
    },
    deleteButton: {
      color: theme.palette.error.main,
    },
    itemsWrapper: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    userItem: {
      marginBottom: theme.spacing(2),
    },
    participantEmailsInputWrapper: {
      width: '100%',
      padding: theme.spacing(2),
    },
    participantEmailsInput: {
      outline: 0,
      border: 0,
      width: '100%',
    },
  };
});

const examUserTypes = ['maintainer', 'invigilator', 'reviewer'];

const AppExamEditor: React.FC<AppExamEditorComponentProps> = ({
  exam,
  mode = 'create',
  roleId,
  dispatch,
  onClose,
  onSubmitExam,
  ...props
}) => {
  let tabs = [];

  if (mode === 'create') {
    tabs = ['BASIC_SETTINGS', 'MAINTAINER', 'INVIGILATOR', 'REVIEWER', 'PARTICIPANT'];
  } else if (mode === 'edit') {
    switch (roleId) {
    case 'resource/exam/initiator': {
      tabs = ['BASIC_SETTINGS', 'MAINTAINER', 'INVIGILATOR', 'REVIEWER', 'PARTICIPANT'];
      break;
    }
    case 'resource/exam/maintainer': {
      tabs = ['BASIC_SETTINGS', 'INVIGILATOR', 'REVIEWER', 'PARTICIPANT'];
      break;
    }
    default:
      break;
    }
  }

  const classes = useStyles();
  const texts = useTexts(dispatch, 'examEditor');
  const systemTexts = useTexts(dispatch, 'system');
  const searchBarTexts = useTexts(dispatch, 'searchBar');

  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchContent, setSearchContent] = useState<string>('');
  const debouncedSearchContent = useDebouncedValue(searchContent);
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
  const [searchedUsersLoading, setSearchedUsersLoading] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);

  const [currentExamUsers, setCurrentExamUsers] = useState<TypedUsers>({
    'MAINTAINER': [],
    'INVIGILATOR': [],
    'REVIEWER': [],
  });

  const [selectedUsers, setSelectedUsers] = useState<TypedUsers>({
    'MAINTAINER': [],
    'INVIGILATOR': [],
    'REVIEWER': [],
  });

  const [examParticipantEmails, setExamParticipantEmails] = useState<string[]>([]);

  const [examUsersLoading, setExamUsersLoading] = useState<Record<string, boolean>>({});

  const changeLoadingState = (type: string, loading: boolean) => {
    setExamUsersLoading({
      ...examUsersLoading,
      [type.toUpperCase()]: loading,
    });
  };

  const fetchExamUsers = (examId: number, type: string) => {
    const currentExamUserType = type.toLowerCase();
    if (examUserTypes.indexOf(currentExamUserType) !== -1) {
      changeLoadingState(type, true);
      getExamUsers(examId, currentExamUserType).then((users) => {
        setCurrentExamUsers({
          ...currentExamUsers,
          [currentExamUserType.toUpperCase()]: users,
        });
      }).finally(() => changeLoadingState(type, false));
    }
  };

  const searchUsers = (search: string) => {
    if (search) {
      setSearchedUsersLoading(true);
      queryAllUsers(search).then((users) => {
        setSearchedUsers(users);
      }).finally(() => setSearchedUsersLoading(false));
    }
  };

  useEffect(() => {
    if (exam && mode === 'edit') {
      for (const examUserType of examUserTypes) {
        fetchExamUsers(exam.id, examUserType);
      }
      getExamUsers(exam.id, 'participant').then((participants) => {
        setExamParticipantEmails((participants || []).map((participant) => participant.email));
      });
    }
  }, [exam, mode]);

  useEffect(() => {
    setSearchedUsers([]);
    searchUsers(debouncedSearchContent);
  }, [debouncedSearchContent, selectedTabIndex]);

  return (
    <>
      <Dialog {...props} scroll="paper" maxWidth="md" fullWidth={true}>
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
          {
            (['MAINTAINER', 'INVIGILATOR', 'REVIEWER'].indexOf(tabs[selectedTabIndex]) !== -1) && (
              <>
                <Box className={classes.searchWrapper}>
                  <Input
                    placeholder={searchBarTexts['INPUT_TO_QUERY']}
                    value={searchContent}
                    onFocus={() => setIsSearching(true)}
                    onValueChange={(value) => setSearchContent(value)}
                  />
                  {
                    isSearching && (
                      <Button
                        variant="contained"
                        color="inherit"
                        startIcon={<CheckIcon />}
                        onClick={() => {
                          setIsSearching(false);
                          setSearchContent('');
                        }}
                      >{systemTexts['OK']}</Button>
                    )
                  }
                </Box>
                {
                  (
                    selectedUsers[tabs[selectedTabIndex]]
                    && _.isArray(selectedUsers[tabs[selectedTabIndex]])
                    && selectedUsers[tabs[selectedTabIndex]].length > 0
                  ) && (
                    <Box className={classes.buttonsWrapper}>
                      <Button
                        variant="text"
                        startIcon={<DeleteIcon />}
                        classes={{
                          root: classes.deleteButton,
                        }}
                        // onClick={}
                      >
                        {systemTexts['DELETE']}&nbsp;
                        ({(selectedUsers[tabs[selectedTabIndex]] || []).length})
                      </Button>
                    </Box>
                  )
                }
              </>
            )
          }
        </DialogTitle>
        <DialogContent>
          {
            tabs[selectedTabIndex] === 'BASIC_SETTINGS' && (<></>)
          }
          {
            tabs[selectedTabIndex] === 'PARTICIPANT' && (
              <Paper classes={{ root: classes.participantEmailsInputWrapper }}>
                <TextareaAutosize
                  value={examParticipantEmails.join(';\n')}
                  rowsMin={3}
                  className={classes.participantEmailsInput}
                  onChange={(event) => {
                    setExamParticipantEmails(event.target.value.split(';\n'));
                  }}
                />
              </Paper>
            )
          }
          {
            examUserTypes.indexOf(tabs[selectedTabIndex].toLowerCase()) !== -1 && (
              examUsersLoading[tabs[selectedTabIndex]]
                ? (
                  <div className="app-loading">
                    <CircularProgress classes={{ root: 'app-loading__icon' }} />
                  </div>
                )
                : isSearching
                  ? searchedUsers.length === 0
                    ? (
                      <div className="app-empty">
                        <FileQuestionIcon classes={{ root: 'app-empty__icon' }} />
                        <Typography classes={{ root: 'app-empty__text' }}>{systemTexts['EMPTY']}</Typography>
                      </div>
                    )
                    : (
                      <Box className={classes.itemsWrapper}>
                        {
                          searchedUsers.map((user, index) => (
                            <AppUserItem
                              key={index}
                              user={user}
                              classes={{
                                root: classes.userItem,
                              }}
                              onSelect={() => {
                                setCurrentExamUsers({
                                  ...currentExamUsers,
                                  [tabs[selectedTabIndex].toUpperCase()]: [...(currentExamUsers[tabs[selectedTabIndex].toUpperCase()] || []), user],
                                });
                              }}
                              onCancelSelect={() => {
                                setCurrentExamUsers({
                                  ...currentExamUsers,
                                  [tabs[selectedTabIndex].toUpperCase()]: currentExamUsers[tabs[selectedTabIndex].toUpperCase()].filter((currentUser) => {
                                    return user.email !== currentUser.email;
                                  }),
                                });
                              }}
                            />
                          ))
                        }
                      </Box>
                    )
                  : currentExamUsers[tabs[selectedTabIndex]].length === 0
                    ? (
                      <div className="app-empty">
                        <FileQuestionIcon classes={{ root: 'app-empty__icon' }} />
                        <Typography classes={{ root: 'app-empty__text' }}>{systemTexts['EMPTY']}</Typography>
                      </div>
                    )
                    : (
                      <Box className={classes.itemsWrapper}>
                        {
                          (currentExamUsers[tabs[selectedTabIndex]] || []).map((user) => (
                            <AppUserItem
                              key={user.email}
                              user={user}
                              classes={{
                                root: classes.userItem,
                              }}
                              onSelect={() => {
                                setSelectedUsers({
                                  ...selectedUsers,
                                  [tabs[selectedTabIndex].toUpperCase()]: [...(selectedUsers[tabs[selectedTabIndex]] || []), user],
                                });
                              }}
                              onCancelSelect={() => {
                                setSelectedUsers({
                                  ...selectedUsers,
                                  [tabs[selectedTabIndex].toUpperCase()]: selectedUsers[tabs[selectedTabIndex]].filter((currentUser) => {
                                    return user.email !== currentUser.email;
                                  }),
                                });
                              }}
                            />
                          ))
                        }
                      </Box>
                    )
            )
          }
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            disabled={submitting}
            onClick={() => {
              if (_.isFunction(onClose)) {
                onClose();
              }
            }}
          >{systemTexts['CANCEL']}</Button>
          <Button
            color="primary"
            // disabled={!validatePaperData(paperData, currentPaperQuestions) || submitting}
            onClick={() => {
              if (mode === 'edit' && !exam) {
                return;
              }
              setSubmitting(true);
              // const request = mode === 'create' ? createPaper(paperData) : updatePaper(paper.id, paperData);
              // request
              //   .then((res) => {
              //     const id = mode === 'create' ? _.get(res, 'id') : paper.id;
              //     if (_.isNumber(id)) {
              //       const requests = [
              //         createPaperQuestions(id, currentPaperQuestions),
              //         ...(currentMaintainers.length ? [
              //           createPaperMaintainers(id, currentMaintainers),
              //         ] : []),
              //       ];
              //       return Promise.all(requests);
              //     }
              //     return;
              //   })
              //   .then(() => {
              //     if (_.isFunction(onSubmitExam)) {
              //       onSubmitExam();
              //     }
              //   })
              //   .finally(() => setSubmitting(false));
            }}
          >{submitting ? systemTexts['SUBMITTING'] : systemTexts['SUBMIT']}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default connect(({ app }: ConnectState) => app)(AppExamEditor) as React.FC<AppExamEditorProps>;

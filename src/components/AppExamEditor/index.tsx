import {
  createExam,
  createExamPaper,
  createExamUsers,
  getExamUsers,
  queryAllMaintainedPapers,
  updateExam,
} from './service';
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
import AppDateTimePicker from '../AppDateTimePicker';
import { camelToSnake } from '../../utils/objects';
import AppIndicator from '../AppIndicator';
import React, { useEffect, useState } from 'react';
import Alert from '@material-ui/lab/Alert';
import AutoComplete from '@material-ui/lab/Autocomplete';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
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
import CheckIcon from '@material-ui/icons/Check';
import DeleteIcon from '@material-ui/icons/Delete';
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
      marginTop: theme.spacing(2),
    },
    participantEmailsInput: {
      outline: 0,
      border: 0,
      width: '100%',
    },
    textField: {
      marginBottom: theme.spacing(2),
    },
  };
});

const examUserTypes = ['maintainer', 'invigilator', 'reviewer'];
const defaultExamBasicInfo: Partial<ExamResponseData> = {
  title: '',
  public: false,
  notifyParticipants: false,
  grades: true,
  delay: 0,
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  resultTime: new Date().toISOString(),
  duration: 0,
};
const defaultExamUsers: TypedUsers = {
  'MAINTAINER': [],
  'INVIGILATOR': [],
  'REVIEWER': [],
};

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

  const [currentExamUsers, setCurrentExamUsers] = useState<TypedUsers>(_.clone(defaultExamUsers));
  const [selectedUsers, setSelectedUsers] = useState<TypedUsers>(_.clone(defaultExamUsers));
  const [examParticipantEmails, setExamParticipantEmails] = useState<string[]>([]);
  const [examBasicInfo, setExamBasicInfo] = useState<Partial<ExamResponseData>>(_.clone(defaultExamBasicInfo));
  const [examPaper, setExamPaper] = useState<PaperResponseData>(null);
  const [searchPapersLoading, setSearchPapersLoading] = useState<boolean>(false);
  const [searchPapersValue, setSearchPapersValue] = useState<string>('');
  const debouncedSearchPapersValue = useDebouncedValue<string>(searchPapersValue);
  const [searchedPapers, setSearchedPapers] = useState<PaperResponseData[]>([]);

  const [examUsersLoading, setExamUsersLoading] = useState<Record<string, boolean>>({});

  const validateExamInfo = (info: Partial<ExamResponseData>, paper: PaperResponseData) => {
    const {
      title,
      startTime,
      endTime,
      duration,
      resultTime,
    } = info;

    if (!title || !startTime || !endTime || !paper) {
      return false;
    }

    if (!startTime && !duration) {
      return false;
    }

    if (startTime && endTime) {
      const startTimestamp = Date.parse(startTime);
      const endTimestamp = Date.parse(endTime);
      if (
        Math.floor((endTimestamp - startTimestamp) / 60000) !== duration
        || endTimestamp - startTimestamp <= 0
      ) {
        return false;
      }
      // eslint-disable-next-line no-unreachable
      if (resultTime) {
        const resultTimestamp = Date.parse(resultTime);
        if (resultTimestamp >= endTimestamp) {
          return true;
        } else {
          return false;
        }
      }
    }

    if (!endTime) {
      return false;
    }

    return true;
  };

  const changeLoadingState = (type: string, loading: boolean) => {
    setExamUsersLoading({
      ...examUsersLoading,
      [type.toUpperCase()]: loading,
    });
  };

  const searchUsers = (search: string) => {
    if (search) {
      setSearchedUsersLoading(true);
      queryAllUsers(search).then((users) => {
        setSearchedUsers(users);
      }).finally(() => setSearchedUsersLoading(false));
    }
  };

  const clearContent = () => {
    setExamBasicInfo(_.clone(defaultExamBasicInfo));
    setCurrentExamUsers(_.clone(defaultExamUsers));
    setSelectedUsers(_.clone(defaultExamUsers));
    setExamPaper(null);
    setExamParticipantEmails([]);
  };

  useEffect(() => {
    if (exam && mode === 'edit') {
      (async () => {
        const users: TypedUsers = _.clone(defaultExamUsers);
        for (const examUserType of examUserTypes) {
          changeLoadingState(examUserType, false);
          try {
            users[examUserType.toUpperCase()] = await getExamUsers(exam.id, examUserType);
          } finally {
            changeLoadingState(examUserType, false);
          }
        }
        setCurrentExamUsers(users);
      })();

      getExamUsers(exam.id, 'participant').then((participants) => {
        setExamParticipantEmails((participants || []).map((participant) => participant.email));
      });

      const paper = _.get(exam, 'paper') as PaperResponseData;

      if (paper) {
        setExamPaper(paper);
      }

      const currentExamBasicInfo = _.pick(exam, [
        'title',
        'public',
        'notifyParticipants',
        'grades',
        'delay',
        'startTime',
        'endTime',
        'resultTime',
        'duration',
      ]);
      setExamBasicInfo(currentExamBasicInfo);
    }
  }, [exam, mode]);

  useEffect(() => {
    setSearchedUsers([]);
    setSelectedUsers(_.clone(defaultExamUsers));
    searchUsers(debouncedSearchContent);
  }, [debouncedSearchContent, selectedTabIndex]);

  useEffect(() => {
    const duration = Date.parse(examBasicInfo.endTime) - Date.parse(examBasicInfo.startTime);
    setExamBasicInfo({
      ...examBasicInfo,
      duration: Math.floor(duration / 60000),
    });
  }, [examBasicInfo.startTime, examBasicInfo.endTime]);

  useEffect(() => {
    setSearchPapersLoading(true);
    queryAllMaintainedPapers(debouncedSearchPapersValue).then((papers) => {
      setSearchedPapers(papers);
    }).finally(() => setSearchPapersLoading(false));
  }, [debouncedSearchPapersValue]);

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
                        onClick={() => {
                          const selectedTabId = tabs[selectedTabIndex];
                          setCurrentExamUsers({
                            ...currentExamUsers,
                            [selectedTabId]: currentExamUsers[selectedTabId].filter((currentExamUser) => {
                              return selectedUsers[selectedTabId].findIndex((selectedUser) => currentExamUser.email === selectedUser.email) === -1;
                            }),
                          });
                          setSelectedUsers({
                            ...selectedUsers,
                            [selectedTabId]: [],
                          });
                        }}
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
            tabs[selectedTabIndex] === 'BASIC_SETTINGS' && (
              <>
                <TextField
                  label={texts['EXAM_TITLE']}
                  variant="outlined"
                  value={examBasicInfo.title}
                  fullWidth={true}
                  classes={{ root: classes.textField }}
                  onChange={(event) => {
                    setExamBasicInfo({
                      ...examBasicInfo,
                      title: event.target.value,
                    });
                  }}
                />
                <AutoComplete
                  value={examPaper}
                  inputValue={searchPapersValue}
                  loading={searchPapersLoading}
                  options={searchedPapers}
                  loadingText={systemTexts['LOADING']}
                  getOptionSelected={(option, value) => option.id === value.id}
                  getOptionLabel={(option) => option.title}
                  renderInput={(autoCompleteProps) => {
                    return (
                      <TextField
                        {...autoCompleteProps}
                        label={texts['SELECT_PAPER']}
                        variant="outlined"
                        fullWidth={true}
                        classes={{ root: classes.textField }}
                      />
                    );
                  }}
                  renderOption={(option) => {
                    return (
                      <>
                        {
                          option.role.id === 'resource/paper/maintainer'
                            && (
                              <Chip color="primary" size="small" label={texts['MAINTAINED']} />
                            )
                        }&nbsp;{option.title}
                      </>
                    );
                  }}
                  onChange={(event, value) => {
                    const paper = value as PaperResponseData;
                    setExamPaper(paper);
                  }}
                  onInputChange={(event, newValue) => {
                    setSearchPapersValue(newValue);
                  }}
                />
                <AppDateTimePicker
                  label={texts['START_TIME']}
                  value={new Date(examBasicInfo.startTime)}
                  fullWidth={true}
                  inputVariant="outlined"
                  className={classes.textField}
                  onChange={(date) => {
                    setExamBasicInfo({
                      ...examBasicInfo,
                      startTime: date.toISOString(),
                    });
                  }}
                />
                <AppDateTimePicker
                  label={texts['END_TIME']}
                  value={new Date(examBasicInfo.endTime)}
                  fullWidth={true}
                  inputVariant="outlined"
                  className={classes.textField}
                  onChange={(date) => {
                    setExamBasicInfo({
                      ...examBasicInfo,
                      endTime: date.toISOString(),
                    });
                  }}
                />
                <AppDateTimePicker
                  label={texts['RESULT_TIME']}
                  value={new Date(examBasicInfo.resultTime)}
                  fullWidth={true}
                  inputVariant="outlined"
                  className={classes.textField}
                  onChange={(date) => {
                    setExamBasicInfo({
                      ...examBasicInfo,
                      resultTime: date.toISOString(),
                    });
                  }}
                />
                {/* TODO: 目前不开放设置时长 */}
                {/* <TextField
                  label={texts['DURATION']}
                  type="number"
                  variant="outlined"
                  value={examBasicInfo.duration}
                  fullWidth={true}
                  classes={{ root: classes.textField }}
                  onChange={(event) => {
                    setExamBasicInfo({
                      ...examBasicInfo,
                      duration: parseInt(event.target.value as unknown as string, 10),
                    });
                  }}
                /> */}
                <FormControlLabel
                  checked={examBasicInfo.public}
                  label={texts['IS_PUBLIC']}
                  control={
                    <Checkbox
                      color="primary"
                      onChange={(event) => {
                        setExamBasicInfo({
                          ...examBasicInfo,
                          public: event.target.checked,
                        });
                      }}
                    />
                  }
                />
                {/* TODO: 目前默认不通知 */}
                {/* <FormControlLabel
                  checked={examBasicInfo.notifyParticipants}
                  label={texts['NOTIFY_PARTICIPANTS']}
                  control={
                    <Checkbox
                      color="primary"
                      onChange={(event) => {
                        setExamBasicInfo({
                          ...examBasicInfo,
                          notifyParticipants: event.target.checked,
                        });
                      }}
                    />
                  }
                /> */}
              </>
            )
          }
          {
            tabs[selectedTabIndex] === 'PARTICIPANT' && (
              <>
                <Alert severity="info">{texts['PARTICIPANT_MESSAGE']}</Alert>
                <Paper classes={{ root: classes.participantEmailsInputWrapper }}>
                  <TextareaAutosize
                    value={examParticipantEmails.join(',')}
                    rowsMin={3}
                    className={classes.participantEmailsInput}
                    onChange={(event) => {
                      setExamParticipantEmails(event.target.value.split(','));
                    }}
                  />
                </Paper>
              </>
            )
          }
          {
            examUserTypes.indexOf(tabs[selectedTabIndex].toLowerCase()) !== -1 && (
              examUsersLoading[tabs[selectedTabIndex]]
                ? (
                  <AppIndicator type="loading" />
                )
                : isSearching
                  ? searchedUsersLoading
                    ? (
                      <AppIndicator type="loading" />
                    )
                    : searchedUsers.length === 0
                      ? (
                        <AppIndicator type="empty" />
                      )
                      : (
                        <Box className={classes.itemsWrapper}>
                          {
                            searchedUsers.map((user, index) => (
                              <AppUserItem
                                key={index}
                                user={user}
                                selected={currentExamUsers[tabs[selectedTabIndex]].findIndex((examUser) => user.email === examUser.email) !== -1}
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
                  : currentExamUsers[tabs[selectedTabIndex].toUpperCase()].length === 0
                    ? (
                      <AppIndicator type="empty" />
                    )
                    : (
                      <Box className={classes.itemsWrapper}>
                        {
                          (currentExamUsers[tabs[selectedTabIndex].toUpperCase()] || []).map((user) => (
                            <AppUserItem
                              key={user.email}
                              user={user}
                              selected={selectedUsers[tabs[selectedTabIndex]].findIndex((examUser) => user.email === examUser.email) !== -1}
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
              clearContent();
              if (_.isFunction(onClose)) {
                onClose();
              }
            }}
          >{systemTexts['CANCEL']}</Button>
          <Button
            color="primary"
            disabled={!validateExamInfo(examBasicInfo, examPaper) || submitting}
            onClick={() => {
              if (mode === 'edit' && !exam) {
                return;
              }
              setSubmitting(true);
              const snakedExamBasicInfo = camelToSnake(examBasicInfo);
              const createExamRequest = mode === 'create'
                ? createExam(snakedExamBasicInfo)
                : updateExam(exam.id, snakedExamBasicInfo);
              createExamRequest
                .then((res) => {
                  const id = mode === 'create' ? _.get(res, 'id') : exam.id;
                  if (_.isNumber(id)) {
                    const requests = Object.keys(currentExamUsers).map((roleId) => {
                      return createExamUsers(id, currentExamUsers[roleId].map((user) => user.email), roleId.toLowerCase());
                    });
                    requests.push(createExamUsers(id, examParticipantEmails, 'participant'));
                    requests.push(createExamPaper(id, examPaper.id));
                    return Promise.all(requests);
                  }
                  return;
                }).then(() => {
                  clearContent();
                  if (_.isFunction(onSubmitExam)) {
                    onSubmitExam();
                  }
                }).finally(() => setSubmitting(false));
            }}
          >{submitting ? systemTexts['SUBMITTING'] : systemTexts['SUBMIT']}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default connect(({ app }: ConnectState) => app)(AppExamEditor) as React.FC<AppExamEditorProps>;

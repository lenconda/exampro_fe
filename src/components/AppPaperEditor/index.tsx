import PaperQuestionItem from './PaperQuestionItem';
import {
  createPaper,
  createPaperMaintainers,
  createPaperQuestion,
  createPaperQuestions,
  getPaperMaintainers,
  getPaperQuestionsWithAnswers,
  queryAllQuestions,
  updatePaper,
} from './service';
import { queryAllUsers } from '../../service';
import { AppState } from '../../models/app';
import {
  Dispatch,
  PaperQuestionResponseData,
  PaperResponseData,
  QuestionResponseData, User,
} from '../../interfaces';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { useTexts } from '../../utils/texts';
import Input from '../AppSearchBar/Input';
import { useDebouncedValue } from '../../utils/hooks';
import AppQuestionItem from '../AppQuestionItem';
import { pipeQuestionResponseToMetadata } from '../../utils/pipes';
import AppUserItem from '../AppUserItem';
import AppIndicator from '../AppIndicator';
import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
import CheckIcon from '@material-ui/icons/Check';
import DeleteIcon from '@material-ui/icons/Delete';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';

export interface AppPaperEditorProps extends DialogProps {
  mode?: 'create' | 'edit';
  paper?: PaperResponseData;
  onSubmitPaper?(): void;
}

export interface AppPaperEditorComponentProps extends AppState, Dispatch, AppPaperEditorProps {}

const useStyles = makeStyles((theme) => {
  return {
    itemsWrapper: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    questionSelectorSearchWrapper: {
      marginTop: theme.spacing(1),
    },
    questionSelectorItemWrapper: {
      marginBottom: theme.spacing(1),
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    questionSelectorItem: {
      flexGrow: 1,
      flexShrink: 1,
      marginLeft: theme.spacing(1),
    },
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
    textfield: {
      marginBottom: theme.spacing(4),
    },
    userItem: {
      marginBottom: theme.spacing(2),
    },
  };
});

const AppPaperEditor: React.FC<AppPaperEditorComponentProps> = ({
  paper,
  mode = 'create',
  dispatch,
  onClose,
  onSubmitPaper,
  ...props
}) => {
  const tabs = [
    'BASE_SETTINGS',
    'QUESTIONS',
    ...(mode === 'edit' && paper && paper.role.id !== 'resource/paper/owner' ? [] : ['MAINTAINER']),
  ];

  const classes = useStyles();
  const texts = useTexts(dispatch, 'paperEditor');
  const systemTexts = useTexts(dispatch, 'system');
  const searchBarTexts = useTexts(dispatch, 'searchBar');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

  const [currentPaperQuestions, setCurrentPaperQuestions] = useState<PaperQuestionResponseData[]>([]);
  const [currentMaintainers, setCurrentMaintainers] = useState<User[]>([]);

  const [paperQuestions, setPaperQuestions] = useState<PaperQuestionResponseData[]>([]);
  const [paperQuestionsLoading, setPaperQuestionsLoading] = useState<boolean>(false);
  const [maintainers, setMaintainers] = useState<User[]>([]);
  const [maintainersLoading, setMaintainersLoading] = useState<boolean>(false);

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchContent, setSearchContent] = useState<string>('');
  const debouncedSearchContent = useDebouncedValue(searchContent);

  const [searchedQuestions, setSearchedQuestions] = useState<QuestionResponseData[]>([]);
  const [searchedQuestionsLoading, setSearchedQuestionsLoading] = useState<boolean>(false);
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
  const [searchedUsersLoading, setSearchedUsersLoading] = useState<boolean>(false);

  const [selectedPaperQuestions, setSelectedPaperQuestions] = useState<PaperQuestionResponseData[]>([]);
  const [selectedMaintainers, setSelectedMaintainers] = useState<User[]>([]);

  const [paperData, setPaperData] = useState<Partial<PaperResponseData>>({});

  const validatePaperData = (
    paper: Partial<PaperResponseData>,
    questions: Partial<PaperQuestionResponseData[]>,
  ): boolean => {
    if (!paper.title) {
      return false;
    }
    if (!_.isNumber(paper.missedChoicesScore) && !paper.missedChoicesScore) {
      return false;
    }
    if (questions.length === 0) {
      return false;
    }
    return true;
  };

  const searchQuestions = (search: string) => {
    if (search) {
      setSearchedQuestionsLoading(true);
      queryAllQuestions(search).then((questions) => {
        setSearchedQuestions(questions);
      }).finally(() => setSearchedQuestionsLoading(false));
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

  const fetchPaperQuestions = (paper: PaperResponseData) => {
    setPaperQuestionsLoading(true);
    getPaperQuestionsWithAnswers(paper.id).then((paperQuestions) => {
      setPaperQuestions(paperQuestions);
    }).finally(() => setPaperQuestionsLoading(false));
  };

  const fetchMaintainers = (paper: PaperResponseData) => {
    setMaintainersLoading(true);
    getPaperMaintainers(paper.id).then((maintainers) => {
      setMaintainers(maintainers);
    }).finally(() => setMaintainersLoading(false));
  };

  useEffect(() => {
    if (mode === 'create') {
      setPaperData({
        title: '',
        missedChoicesScore: 0,
        public: false,
      });
    } else if (mode === 'edit') {
      if (paper) {
        const {
          title = '',
          missedChoicesScore = 0,
          public: isPublic = false,
        } = paper;
        setPaperData({
          title,
          missedChoicesScore,
          public: isPublic,
        });
        fetchPaperQuestions(paper);
        fetchMaintainers(paper);
      }
    }
  }, [mode, paper]);

  useEffect(() => {
    setSearchedQuestions([]);
    setSearchedUsers([]);
    if (tabs[selectedTabIndex] === 'QUESTIONS') {
      searchQuestions(debouncedSearchContent);
    } else if (tabs[selectedTabIndex] === 'MAINTAINER') {
      searchUsers(debouncedSearchContent);
    }
  }, [debouncedSearchContent, selectedTabIndex]);

  const reorderPaperQuestions = (
    list: PaperQuestionResponseData[],
    startIndex: number,
    endIndex: number,
  ): PaperQuestionResponseData[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || !source) {
      return;
    }
    const newPaperQuestions = reorderPaperQuestions(Array.from(currentPaperQuestions), source.index, destination.index);
    setCurrentPaperQuestions(newPaperQuestions.map((paperQuestion, index) => {
      return {
        ...paperQuestion,
        order: index + 1,
      };
    }));
  };

  useEffect(() => {
    if (!paperQuestionsLoading) {
      setCurrentPaperQuestions(paperQuestions);
    }
  }, [paperQuestions, paperQuestionsLoading]);

  useEffect(() => {
    if (!maintainersLoading) {
      setCurrentMaintainers(maintainers);
    }
  }, [maintainers, maintainersLoading]);

  useEffect(() => {
    setIsSearching(false);
    setSearchContent('');
    setSelectedPaperQuestions([]);
  }, [selectedTabIndex]);

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
            (tabs[selectedTabIndex] === 'QUESTIONS' || tabs[selectedTabIndex] === 'MAINTAINER') && (
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
                  ((selectedPaperQuestions.length > 0 || selectedMaintainers.length > 0) && !isSearching) && (
                    <Box className={classes.buttonsWrapper}>
                      <Button
                        variant="text"
                        startIcon={<DeleteIcon />}
                        classes={{
                          root: classes.deleteButton,
                        }}
                        onClick={() => {
                          if (tabs[selectedTabIndex] === 'QUESTIONS') {
                            setCurrentPaperQuestions(currentPaperQuestions.filter((paperQuestion) => {
                              return selectedPaperQuestions.findIndex((selectedPaperQuestion) => {
                                return paperQuestion.id === selectedPaperQuestion.id;
                              }) === -1;
                            }));
                            setSelectedPaperQuestions([]);
                          } else if (tabs[selectedTabIndex] === 'MAINTAINER') {
                            setCurrentMaintainers(currentMaintainers.filter((maintainer) => {
                              return selectedMaintainers.findIndex((selectedMaintainer) => {
                                return selectedMaintainer.email === maintainer.email;
                              }) === -1;
                            }));
                            setSelectedMaintainers([]);
                          }
                        }}
                      >
                        {systemTexts['DELETE']}&nbsp;
                        {
                          tabs[selectedTabIndex] === 'QUESTIONS' && `(${selectedPaperQuestions.length})`
                        }
                        {
                          tabs[selectedTabIndex] === 'MAINTAINER' && `(${selectedMaintainers.length})`
                        }
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
            tabs[selectedTabIndex] === 'BASE_SETTINGS' && (
              <>
                <TextField
                  variant="outlined"
                  value={paperData.title}
                  label={texts['ENTER_TITLE']}
                  fullWidth={true}
                  classes={{
                    root: classes.textfield,
                  }}
                  onChange={(event) => {
                    setPaperData({
                      ...paperData,
                      title: event.target.value,
                    });
                  }}
                />
                <TextField
                  variant="outlined"
                  value={paperData.missedChoicesScore}
                  label={texts['MISS_CHOICE_POINTS']}
                  fullWidth={true}
                  type="number"
                  classes={{
                    root: classes.textfield,
                  }}
                  onChange={(event) => {
                    setPaperData({
                      ...paperData,
                      missedChoicesScore: event.target.value ? parseInt(event.target.value, 10) : 0,
                    });
                  }}
                />
                <FormControlLabel
                  checked={paperData.public}
                  label={texts['IS_PUBLIC']}
                  control={
                    <Checkbox
                      color="primary"
                      onChange={(event) => {
                        setPaperData({
                          ...paperData,
                          public: event.target.checked,
                        });
                      }}
                    />
                  }
                />
              </>
            )
          }
          {
            tabs[selectedTabIndex] === 'QUESTIONS' && (
              <>
                <Box className={classes.itemsWrapper}>
                  {
                    isSearching
                      ? searchedQuestionsLoading
                        ? (
                          <AppIndicator type="loading" />
                        )
                        : !searchContent
                          ? null
                          : searchedQuestions.length > 0
                            ? searchedQuestions.map((question, index) => {
                              return (
                                <Paper
                                  key={index}
                                  elevation={0}
                                  classes={{ root: classes.questionSelectorItemWrapper }}
                                >
                                  <Checkbox
                                    color="primary"
                                    checked={currentPaperQuestions.findIndex((currentQuestion) => question.id === currentQuestion.question.id) !== -1}
                                    onChange={(event) => {
                                      const checked = event.target.checked;
                                      if (checked) {
                                        setCurrentPaperQuestions(currentPaperQuestions.concat(createPaperQuestion(question, 0)));
                                      } else {
                                        setSelectedPaperQuestions(selectedPaperQuestions.filter((paperQuestion) => paperQuestion.question.id !== question.id));
                                        setCurrentPaperQuestions(currentPaperQuestions.filter((paperQuestion) => paperQuestion.question.id !== question.id));
                                      }
                                    }}
                                  />
                                  <AppQuestionItem
                                    classes={{ root: classes.questionSelectorItem }}
                                    answerable={false}
                                    question={pipeQuestionResponseToMetadata(question)}
                                    showButtons={[]}
                                  />
                                </Paper>
                              );
                            })
                            : (
                              <AppIndicator type="empty" />
                            )
                      : paperQuestionsLoading
                        ? (
                          <AppIndicator type="loading" />
                        )
                        : currentPaperQuestions.length > 0
                          ? (
                            <DragDropContext onDragEnd={handleDragEnd}>
                              <Droppable droppableId="paper-questions">
                                {
                                  (provided) => {
                                    return (
                                      <Paper elevation={0} ref={provided.innerRef}>
                                        {
                                          currentPaperQuestions.map((paperQuestion, index) => {
                                            const question = pipeQuestionResponseToMetadata(paperQuestion.question);
                                            return (
                                              <PaperQuestionItem
                                                key={question.id}
                                                draggableId={question.id.toString()}
                                                index={index}
                                                questionNumber={index + 1}
                                                question={question}
                                                points={paperQuestion.points}
                                                selected={selectedPaperQuestions.findIndex((currentQuestion) => {
                                                  return paperQuestion.id === currentQuestion.id;
                                                }) !== -1}
                                                onSelect={() => {
                                                  setSelectedPaperQuestions(selectedPaperQuestions.concat(paperQuestion));
                                                }}
                                                onCancelSelect={() => {
                                                  setSelectedPaperQuestions(selectedPaperQuestions.filter((currentPaperQuestion) => {
                                                    return currentPaperQuestion.id !== paperQuestion.id;
                                                  }));
                                                }}
                                                onPointsChange={(points) => {
                                                  setCurrentPaperQuestions(currentPaperQuestions.map((currentPaperQuestion, currentIndex) => {
                                                    if (currentIndex === index) {
                                                      return {
                                                        ...currentPaperQuestion,
                                                        points,
                                                      } as PaperQuestionResponseData;
                                                    } else {
                                                      return currentPaperQuestion;
                                                    }
                                                  }));
                                                }}
                                              />
                                            );
                                          })
                                        }
                                        {provided.placeholder}
                                      </Paper>
                                    );
                                  }
                                }
                              </Droppable>
                            </DragDropContext>
                          )
                          : (
                            <AppIndicator type="empty" />
                          )
                  }
                </Box>
              </>
            )
          }
          {
            tabs[selectedTabIndex] === 'MAINTAINER' && (
              <Box className={classes.itemsWrapper}>
                {
                  isSearching
                    ? searchedUsersLoading
                      ? (
                        <AppIndicator type="loading" />
                      )
                      : !searchContent
                        ? null
                        : searchedUsers.length > 0
                          ? searchedUsers.map((user, index) => {
                            return (
                              <AppUserItem
                                key={index}
                                user={user}
                                selected={maintainers.findIndex((maintainer) => maintainer.email === user.email) !== -1}
                                classes={{
                                  root: classes.userItem,
                                }}
                                onSelect={() => {
                                  setMaintainers(maintainers.concat(user));
                                }}
                                onCancelSelect={() => {
                                  setMaintainers(maintainers.filter((maintainer) => user.email !== maintainer.email));
                                }}
                              />
                            );
                          })
                          : (
                            <AppIndicator type="empty" />
                          )
                    : maintainersLoading
                      ? (
                        <AppIndicator type="loading" />
                      )
                      : currentMaintainers.length > 0
                        ? currentMaintainers.map((maintainer) => {
                          return (
                            <AppUserItem
                              key={maintainer.email}
                              user={maintainer}
                              selected={selectedMaintainers.findIndex((currentMaintainer) => maintainer.email === currentMaintainer.email) !== -1}
                              classes={{
                                root: classes.userItem,
                              }}
                              onSelect={() => {
                                setSelectedMaintainers(selectedMaintainers.concat(maintainer));
                              }}
                              onCancelSelect={() => {
                                setSelectedMaintainers(selectedMaintainers.filter((item) => item.email !== maintainer.email));
                              }}
                            />
                          );
                        })
                        : (
                          <AppIndicator type="empty" />
                        )
                }
              </Box>
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
            disabled={!validatePaperData(paperData, currentPaperQuestions) || submitting}
            onClick={() => {
              if (mode === 'edit' && !paper) {
                return;
              }
              setSubmitting(true);
              const request = mode === 'create' ? createPaper(paperData) : updatePaper(paper.id, paperData);
              request
                .then((res) => {
                  const id = mode === 'create' ? _.get(res, 'id') : paper.id;
                  if (_.isNumber(id)) {
                    const requests = [
                      createPaperQuestions(id, currentPaperQuestions),
                      ...(currentMaintainers.length ? [
                        createPaperMaintainers(id, currentMaintainers),
                      ] : []),
                    ];
                    return Promise.all(requests);
                  }
                  return;
                })
                .then(() => {
                  if (_.isFunction(onSubmitPaper)) {
                    onSubmitPaper();
                  }
                })
                .finally(() => setSubmitting(false));
            }}
          >{submitting ? systemTexts['SUBMITTING'] : systemTexts['SUBMIT']}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default connect(({ app }: ConnectState) => app)(AppPaperEditor) as React.FC<AppPaperEditorProps>;

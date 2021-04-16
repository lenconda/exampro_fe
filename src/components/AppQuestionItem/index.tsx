import { AppQuestionMetaData } from '../AppQuestionEditor';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import { Dispatch, QuestionChoice, QuestionType } from '../../interfaces';
import Editor from '../Editor';
import { useTexts } from '../../utils/texts';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Card, { CardProps } from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import InputBase from '@material-ui/core/InputBase';
import Radio, { RadioProps } from '@material-ui/core/Radio';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';
import ArrowDropdownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import React, { useEffect, useRef, useState } from 'react';
import { ContentState, EditorState } from 'draft-js';
import { lighten, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import _ from 'lodash';

type ChoiceSelectorProps = (CheckboxProps | RadioProps) & {
  questionType: QuestionType;
};

const ChoiceSelector: React.FC<ChoiceSelectorProps> = ({
  questionType,
  ...props
}) => {
  switch (questionType) {
  case 'single_choice': {
    return <Radio {...props} />;
  }
  case 'multiple_choices': {
    return <Checkbox {...props} />;
  }
  default:
    return null;
  }
};

export interface AppQuestionItemProps extends CardProps {
  questionNumber?: number;
  question?: AppQuestionMetaData;
  collapseHeight?: number;
  canCollapse?: boolean;
  answerable?: boolean;
  onAnswerChange?(question: AppQuestionMetaData, answer: string[] | ContentState): void;
}

export interface AppQuestionItemComponentProps extends AppState, Dispatch, AppQuestionItemProps {}

const useStyles = makeStyles((theme) => {
  return {
    cardContent: {
      userSelect: 'none',
    },
    contentWrapper: {
      display: 'flex',
      flexDirection: 'row',
    },
    questionNumberTypeWrapper: {
      width: 42,
      flexGrow: 0,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
    },
    questionTypeWrapper: {
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    categoryChip: {
      marginRight: theme.spacing(1),
    },
    cardContentCollapsed: (props: AppQuestionItemProps) => ({
      height: props.collapseHeight,
      overflow: 'hidden',
    }),
    choiceWrapper: (props: AppQuestionItemProps) => ({
      paddingTop: theme.spacing(1),
      paddingRight: theme.spacing(2),
      paddingBottom: theme.spacing(1),
      paddingLeft: theme.spacing(props.answerable ? 1 : 2),
      marginBottom: theme.spacing(2),
      minHeight: 64,
      display: 'flex',
      alignItems: 'center',
      cursor: props.answerable ? 'pointer' : 'default',
      '&:last-child': {
        marginBottom: 0,
      },
    }),
    choiceAnswerTag: {
      marginRight: theme.spacing(1),
    },
    choiceContent: {
      wordBreak: 'break-all',
    },
    choice: {
      cursor: 'pointer',
    },
    choiceSelected: {
      backgroundColor: lighten(theme.palette.primary.main, 0.85),
    },
    shortAnswerEditorWrapper: {
      border: `1px solid ${theme.palette.grey[300]}`,
    },
    blankWrapper: {
      paddingTop: theme.spacing(1),
      paddingRight: theme.spacing(2),
      paddingBottom: theme.spacing(1),
      paddingLeft: theme.spacing(2),
      marginBottom: theme.spacing(2),
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      '&:last-child': {
        marginBottom: 0,
      },
    },
    blankNumberWrapper: {
      marginRight: theme.spacing(1),
    },
  };
});

const AppQuestionItem: React.FC<AppQuestionItemComponentProps> = ({
  questionNumber = 0,
  collapseHeight = 150,
  canCollapse = true,
  answerable = true,
  question,
  dispatch,
  onAnswerChange: onChange,
  ...props
}) => {
  if (!question) { return null }

  const {
    content,
    choices = [],
    answer,
    type,
    blankCount = 0,
    categories = [],
  } = question;

  const classes = useStyles({
    answerable,
    collapseHeight,
  });
  const texts = useTexts(dispatch, 'questionItem');
  const editorTexts = useTexts(dispatch, 'editor');
  const cardContentRef = useRef<HTMLDivElement>(null);
  const [collapseNecessity, setCollapseNecessity] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [selectedChoiceIndexes, setSelectedChoiceIndexes] = useState<number[]>([]);
  const [filledBlanks, setFilledBlanks] = useState<string[]>(new Array(blankCount).fill(''));
  const [
    shortAnswerContent,
    setShortAnswerContent,
  ] = useState<ContentState>(EditorState.createEmpty().getCurrentContent());

  useEffect(() => {
    if (cardContentRef.current) {
      const { clientHeight } = cardContentRef.current;
      if (canCollapse && clientHeight > collapseHeight) {
        setCollapsed(true);
        setCollapseNecessity(true);
      } else {
        setCollapsed(false);
        setCollapseNecessity(false);
      }
    }
  }, [cardContentRef]);

  useEffect(() => {
    if (_.isFunction(onChange)) {
      if (type === 'single_choice' || type === 'multiple_choices') {
        onChange(question, selectedChoiceIndexes.map((value) => (value + 1).toString()));
      } else if (type === 'fill_in_blank') {
        onChange(question, filledBlanks);
      } else if (type === 'short_answer') {
        onChange(question, shortAnswerContent);
      }
    }
  }, [type, selectedChoiceIndexes, filledBlanks, shortAnswerContent]);

  const generateChoice = (
    choice: QuestionChoice,
    index: number,
  ) => {
    return (
      <Paper
        key={index}
        classes={{
          root: clsx(classes.choiceWrapper, {
            [classes.choiceSelected]: selectedChoiceIndexes.indexOf(index) !== -1,
          }),
        }}
        onClick={() => {
          if (!answerable) { return }
          if (type === 'single_choice') {
            setSelectedChoiceIndexes([index]);
          } else if (type === 'multiple_choices') {
            if (selectedChoiceIndexes.indexOf(index) === -1) {
              setSelectedChoiceIndexes(selectedChoiceIndexes.concat(index));
            } else {
              setSelectedChoiceIndexes(selectedChoiceIndexes.filter((value) => value !== index));
            }
          }
        }}
      >
        {
          answerable && (
            <ChoiceSelector
              color="primary"
              classes={{ root: classes.choice }}
              checked={selectedChoiceIndexes.indexOf(index) !== -1}
              questionType={type}
              onChange={(event) => event.preventDefault()}
            />
          )
        }
        <Typography classes={{ root: classes.cardContent }}>
          {
            (!answerable && Array.isArray(answer) && answer.indexOf((index + 1).toString()) !== -1) && (
              <Chip
                component="span"
                variant="outlined"
                color="primary"
                icon={<CheckIcon />}
                label={texts['IS_ANSWER']}
                size="small"
                classes={{ root: classes.choiceAnswerTag }}
              />
            )
          }
          {choice.content}
        </Typography>
      </Paper>
    );
  };

  return (
    <Card {...props}>
      <CardContent
        ref={cardContentRef}
        classes={{
          root: clsx(classes.cardContent, {
            [classes.cardContentCollapsed]: collapsed,
          }),
        }}
      >
        <Box className={classes.contentWrapper}>
          {
            questionNumber > 0 && (
              <Box className={classes.questionNumberTypeWrapper}>
                <Typography variant="h6">{questionNumber}</Typography>
              </Box>
            )
          }
          <Box>
            <Box className={classes.questionTypeWrapper}>
              <Chip
                size="small"
                label={texts[type.toUpperCase()]}
              />
            </Box>
            {
              (!answerable && categories.length > 0) && (
                <Box className={classes.questionTypeWrapper}>
                  {
                    categories.map((category, index) => {
                      return (
                        <Chip
                          key={index}
                          size="small"
                          label={category.name}
                          variant="outlined"
                          classes={{ root: classes.categoryChip }}
                        />
                      );
                    })
                  }
                </Box>
              )
            }
            <Editor
              texts={editorTexts}
              readonly={true}
              editorState={EditorState.createWithContent(content)}
            />
          </Box>
        </Box>
        {
          (type === 'single_choice' || type === 'multiple_choices') && (
            <Paper elevation={0}>
              {
                choices.map((choice, index) => {
                  return generateChoice(choice, index);
                })
              }
            </Paper>
          )
        }
        {
          (answerable && type === 'short_answer') && (
            <Box className={classes.shortAnswerEditorWrapper}>
              <Editor
                texts={editorTexts}
                onChange={(data) => setShortAnswerContent(data.getCurrentContent())}
              />
            </Box>
          )
        }
        {
          (answerable && type === 'fill_in_blank' && blankCount > 0) && (
            <Box>
              {
                new Array(blankCount).fill(null).map((value, index) => {
                  return (
                    <Paper key={index} classes={{ root: classes.blankWrapper }}>
                      <Typography classes={{ root: classes.blankNumberWrapper }}>{index + 1}.</Typography>
                      <InputBase
                        onChange={(event) => {
                          setFilledBlanks(filledBlanks.map((value, answerIndex) => {
                            if (index === answerIndex) {
                              return event.target.value;
                            } else {
                              return value;
                            }
                          }));
                        }}
                      />
                    </Paper>
                  );
                })
              }
            </Box>
          )
        }
      </CardContent>
      {
        (canCollapse && collapseNecessity) && (
          <CardActions>
            <Button
              color="primary"
              endIcon={collapsed ? <ArrowDropdownIcon /> : <ArrowDropUpIcon />}
              onClick={() => setCollapsed(!collapsed)}
            >{collapsed ? texts['EXPAND'] : texts['COLLAPSE']}</Button>
          </CardActions>
        )
      }
    </Card>
  );
};

export default connect(({ app }: ConnectState) => app)(AppQuestionItem) as React.FC<AppQuestionItemProps>;

import { AppQuestionMetaData } from '../AppQuestionEditor';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import { Dispatch, QuestionChoice } from '../../interfaces';
import Editor from '../Editor';
import { useTexts } from '../../utils/texts';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import InputBase from '@material-ui/core/InputBase';
import Radio from '@material-ui/core/Radio';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';
import ArrowDropdownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import React, { useEffect, useRef, useState } from 'react';
import { EditorState } from 'draft-js';
import { lighten, makeStyles } from '@material-ui/core';
import clsx from 'clsx';

export interface AppQuestionItemProps {
  questionNumber?: number;
  question?: AppQuestionMetaData;
  collapseHeight?: number;
  canCollapse?: boolean;
  answerable?: boolean;
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
}) => {
  if (!question) { return null }

  const {
    content,
    choices = [],
    answer,
    type,
    blankCount,
  } = question;

  const classes = useStyles({
    answerable,
    collapseHeight,
  });
  const texts = useTexts(dispatch, 'questionItem');
  const cardContentRef = useRef<HTMLDivElement>(null);
  const [collapseNecessity, setCollapseNecessity] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);

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

  const generateChoice = (
    choice: QuestionChoice,
    index: number,
  ) => {
    return (
      <Paper key={index} classes={{ root: classes.choiceWrapper }}>
        {
          answerable && (
            type === 'single_choice'
              ? (
                <Radio color="primary" />
              )
              : (
                <Checkbox color="primary" />
              )
          )
        }
        <Typography classes={{ root: classes.cardContent }}>
          {
            (!answerable && Array.isArray(answer) && answer.indexOf((index + 1).toString()) !== -1) && (
              <Chip
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
    <Card>
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
                variant="outlined"
                size="small"
                label={texts[type.toUpperCase()]}
              />
            </Box>
            <Editor
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
              <Editor />
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
                      <InputBase />
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

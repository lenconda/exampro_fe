import { AppQuestionMetaData } from '../AppQuestionEditor';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import { Dispatch, QuestionChoice } from '../../interfaces';
import Editor from '../Editor';
import { useTexts } from '../../utils/texts';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import Radio from '@material-ui/core/Radio';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';
import ArrowDropdownIcon from '@material-ui/icons/ArrowDropDown';
import React, { useEffect, useRef, useState } from 'react';
import { EditorState } from 'draft-js';
import { lighten, makeStyles } from '@material-ui/core';

export interface AppQuestionItemProps {
  index?: number;
  question?: AppQuestionMetaData;
  collapseHeight?: number;
  defaultCollapsed?: boolean;
  answerable?: boolean;
}

export interface AppQuestionItemComponentProps extends AppState, Dispatch, AppQuestionItemProps {}

const useStyles = makeStyles((theme) => {
  return {
    cardContent: {
      userSelect: 'none',
    },
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
    divider: {
      marginBottom: theme.spacing(2),
    },
  };
});

const AppQuestionItem: React.FC<AppQuestionItemComponentProps> = ({
  index: questionIndex = -1,
  collapseHeight = 150,
  defaultCollapsed = false,
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
  } = question;

  const classes = useStyles({ answerable });
  const texts = useTexts(dispatch, 'questionItem');
  const cardContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardContentRef.current) {
      const { clientHeight } = cardContentRef.current;
      console.log(clientHeight);
    }
  }, [cardContentRef]);

  const generateChoice = (
    choice: QuestionChoice,
    index: number,
  ) => {
    return (
      <Paper elevation={1} classes={{ root: classes.choiceWrapper }}>
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
      <CardContent classes={{ root: classes.cardContent }} ref={cardContentRef}>
        <Editor
          readonly={true}
          editorState={EditorState.createWithContent(content)}
        />
        <Divider classes={{ root: classes.divider }} />
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
      </CardContent>
      <CardActions>
        <Button
          color="primary"
          endIcon={<ArrowDropdownIcon />}
        >{texts['EXPAND']}</Button>
      </CardActions>
    </Card>
  );
};

export default connect(({ app }: ConnectState) => app)(AppQuestionItem) as React.FC<AppQuestionItemProps>;

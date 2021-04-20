import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { Dispatch, User } from '../../interfaces';
import { AppState } from '../../models/app';
import { AppQuestionMetaData } from '../AppQuestionEditor';
import AppQuestionItem from '../AppQuestionItem';
import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import { Draggable, DraggableProps } from 'react-beautiful-dnd';
import { Checkbox, makeStyles } from '@material-ui/core';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import _ from 'lodash';

export type PaperQuestionItemProps = Omit<DraggableProps, 'children'> & {
  selected?: boolean;
  questionNumber?: number;
  question?: AppQuestionMetaData;
  onSelect?(): void;
  onCancelSelect?(): void;
};
export interface PaperQuestionItemComponentProps extends PaperQuestionItemProps, Dispatch, AppState {}

const useStyles = makeStyles((theme) => {
  return {
    wrapper: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing(1),
    },
    dragIndicator: {
      color: theme.palette.grey.A200,
    },
    questionItem: {
      flexGrow: 1,
      flexShrink: 1,
      marginLeft: theme.spacing(1),
    },
  };
});

const PaperQuestionItem: React.FC<PaperQuestionItemComponentProps> = ({
  selected = false,
  questionNumber,
  question,
  dispatch,
  onSelect,
  onCancelSelect,
  ...props
}) => {
  const classes = useStyles();

  return (
    <Draggable {...props}>
      {
        (provided, snapshot) => {
          return (
            <Paper
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              classes={{ root: classes.wrapper }}
              elevation={snapshot.isDragging ? 3 : 0}
            >
              <DragIndicatorIcon classes={{ root: classes.dragIndicator }} />
              <Checkbox
                color="primary"
                checked={selected}
                onChange={(event) => {
                  if (event.target.checked) {
                    if (_.isFunction(onSelect)) {
                      onSelect();
                    }
                  } else {
                    if (_.isFunction(onCancelSelect)) {
                      onCancelSelect();
                    }
                  }
                }}
              />
              {
                question && (
                  <AppQuestionItem
                    elevation={snapshot.isDragging ? 0 : 1}
                    classes={{ root: classes.questionItem }}
                    answerable={false}
                    question={question}
                    questionNumber={questionNumber}
                    showButtons={[]}
                  />
                )
              }
            </Paper>
          );
        }
      }
    </Draggable>
  );
};

export default connect(({ app }: ConnectState) => app)(PaperQuestionItem) as React.FC<PaperQuestionItemProps>;

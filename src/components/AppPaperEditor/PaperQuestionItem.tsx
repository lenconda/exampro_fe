import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { AppQuestionMetaData, Dispatch } from '../../interfaces';
import { AppState } from '../../models/app';
import AppQuestionItem from '../AppQuestionItem';
import { useTexts } from '../../utils/texts';
import React from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { Draggable, DraggableProps } from 'react-beautiful-dnd';
import { makeStyles } from '@material-ui/core/styles';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import _ from 'lodash';
import clsx from 'clsx';

export type PaperQuestionItemProps = Omit<DraggableProps, 'children'> & {
  selected?: boolean;
  points?: number;
  questionNumber?: number;
  question?: AppQuestionMetaData;
  onPointsChange?(points: number): void;
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
      marginLeft: theme.spacing(1),
      width: '100%',
    },
    questionEditorWrapper: {
      flexGrow: 1,
      flexShrink: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    pointsWrapper: {
      display: 'flex',
      alignItems: 'center',
      marginTop: theme.spacing(1),
      marginLeft: theme.spacing(1),
    },
    pointsInput: {
      marginLeft: theme.spacing(1),
    },
  };
});

const PaperQuestionItem: React.FC<PaperQuestionItemComponentProps> = ({
  selected = false,
  questionNumber,
  question,
  points,
  dispatch,
  onPointsChange,
  onSelect,
  onCancelSelect,
  ...props
}) => {
  const classes = useStyles();
  const texts = useTexts(dispatch, 'paperEditor');

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
              <Box className={classes.questionEditorWrapper}>
                <AppQuestionItem
                  selectable={true}
                  selected={selected}
                  elevation={0}
                  variant={snapshot.isDragging ? 'elevation' : 'outlined'}
                  classes={{
                    root: clsx(classes.questionItem, {
                      'app-disappear': !question,
                    }),
                  }}
                  answerable={false}
                  question={question}
                  questionNumber={questionNumber}
                  showButtons={[]}
                  onSelectQuestion={onSelect}
                  onCancelSelectQuestion={onCancelSelect}
                />
                <Box className={classes.pointsWrapper}>
                  <Typography>{texts['POINTS']}: </Typography>
                  <TextField
                    className={classes.pointsInput}
                    type="number"
                    value={points}
                    onChange={(event) => {
                      if (_.isFunction(onPointsChange)) {
                        onPointsChange(event.target.value);
                      }
                    }}
                  />
                </Box>
              </Box>
            </Paper>
          );
        }
      }
    </Draggable>
  );
};

export default connect(({ app }: ConnectState) => app)(PaperQuestionItem) as React.FC<PaperQuestionItemProps>;

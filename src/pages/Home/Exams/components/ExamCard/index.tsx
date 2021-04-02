import { connect } from '../../../../../patches/dva';
import { ConnectState } from '../../../../../models';
import { AppState } from '../../../../../models/app';
import StatusChip from '../StatusChip';
import { Dispatch, Exam } from '../../../../../interfaces';
import { getExamStatus } from '../../service';
import { useTexts } from '../../../../../utils/texts';
import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Card, { CardProps } from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles, SvgIconTypeMap } from '@material-ui/core';
import CalendarCheck from 'mdi-material-ui/CalendarCheck';
import CalendarClock from 'mdi-material-ui/CalendarClock';
import TimerSandEmpty from 'mdi-material-ui/TimerSandEmpty';
import clsx from 'clsx';
import _ from 'lodash';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';

export interface ExamCardComponentProps extends CardProps {
  exam: Exam;
}

export interface ExamCardProps extends ExamCardComponentProps, AppState, Dispatch {}

interface ExamCardInfoItem {
  title: string;
  value: React.ReactText;
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
}
type ExamCardInfoType = Record<string, ExamCardInfoItem>;

const useStyles = makeStyles((theme) => {
  return {
    cardWrapper: {
      width: '100%',
      userSelect: 'none',
    },
    statusChip: {
      marginRight: theme.spacing(1.2),
    },
    title: {
      marginBottom: theme.spacing(1.5),
    },
    icon: {
      marginRight: theme.spacing(1.2),
    },
    wrapper: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing(0.6),
    },
    item: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing(1),
    },
    actions: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
    },
    actionButton: {
      flexGrow: 0,
      flexShrink: 0,
    },
  };
});

const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  dispatch,
  ...props
}) => {
  const examCardTexts = useTexts(dispatch, 'examCard');
  const [info, setInfo] = useState<ExamCardInfoType>({});
  const classes = useStyles();
  const {
    title = examCardTexts['004'],
    startTime: examStartTime,
    endTime: examEndTime,
    duration: examDuration,
  } = exam;
  const status = getExamStatus(exam);

  const durationPartialInfo = {
    title: examCardTexts['003'],
    Icon: TimerSandEmpty,
  };

  useEffect(() => {
    const currentInfo: ExamCardInfoType = {
      startTime: {
        title: examCardTexts['001'],
        value: examStartTime
          ? new Date(examStartTime).toLocaleDateString()
          : examCardTexts['006'],
        Icon: CalendarClock,
      },
      endTime: {
        title: examCardTexts['002'],
        value: new Date(examEndTime).toLocaleString(),
        Icon: CalendarCheck,
      },
    };
    if (examDuration) {
      currentInfo.duration = {
        ...durationPartialInfo,
        value: examDuration,
      };
    } else {
      if (!examStartTime) {
        currentInfo.duration = {
          ...durationPartialInfo,
          value: examCardTexts['005'],
        };
      } else {
        const millisecondDifference = Math.abs(Date.parse(examEndTime) - Date.parse(examStartTime));
        currentInfo.duration = {
          ...durationPartialInfo,
          value: Math.round(millisecondDifference / 60000),
        };
      }
    }
    setInfo(currentInfo);
  }, [examStartTime, examEndTime, examDuration, examCardTexts]);

  return (
    <Card
      {...props}
      classes={{
        root: clsx(classes.cardWrapper, _.get(props, 'classes.root') || ''),
      }}
    >
      <CardContent>
        <Tooltip title={title || ''}>
          <Typography
            variant="subtitle1"
            align="left"
            noWrap={true}
            classes={{ root: classes.title }}
          >
            <StatusChip
              status={status}
              classes={{ root: classes.statusChip }}
            />
            {title}
          </Typography>
        </Tooltip>
        {
          Object.keys(info).map((key, index) => {
            const infoItem = info[key];
            const { title, Icon, value } = infoItem;
            return (
              <Typography
                key={index}
                noWrap={true}
                classes={{ root: classes.wrapper }}
              >
                <Typography
                  color="textSecondary"
                  noWrap={true}
                  component="span"
                  classes={{ root: classes.wrapper }}
                >
                  <Typography variant="subtitle2" component="span" classes={{ root: classes.item }}>
                    <Icon fontSize="small" classes={{ root: classes.icon }} />
                    {title}
                  </Typography>
                  <Tooltip title={value || ''}>
                    <Typography variant="subtitle2" component="span" color="textPrimary" noWrap={true}>
                      {value}
                    </Typography>
                  </Tooltip>
                </Typography>
              </Typography>
            );
          })
        }
      </CardContent>
      <Divider />
      <CardActions classes={{ root: classes.actions }}>
        {
          status === 'FINISHED' && (
            <Button
              color="primary"
              classes={{ root: classes.actionButton }}
            >{examCardTexts['008']}</Button>
          )
        }
        <Button
          disabled={status !== 'IN_PROGRESS'}
          color="primary"
          classes={{ root: classes.actionButton }}
        >{examCardTexts['007']}</Button>
      </CardActions>
    </Card>
  );
};

export default connect(({ app }: ConnectState) => app)(ExamCard) as React.FC<ExamCardComponentProps>;

import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import { Dispatch } from '../../interfaces';
import { useTexts } from '../../utils/texts';
import DateFnsUtils from '@date-io/date-fns';
import * as locales from 'date-fns/locale';
import React from 'react';
import { MuiPickersUtilsProvider, DateTimePicker, DateTimePickerProps } from '@material-ui/pickers';

export interface AppDateTimePickerProps extends DateTimePickerProps {}
export interface AppDateTimePickerComponentProps extends DateTimePickerProps, AppState, Dispatch {}

const AppDateTimePicker: React.FC<AppDateTimePickerComponentProps> = ({
  dispatch,
  locale,
  ...props
}) => {
  const texts = useTexts(dispatch, 'dateTimePicker');
  const systemTexts = useTexts(dispatch, 'system');

  return (
    <MuiPickersUtilsProvider
      utils={DateFnsUtils}
      locale={locales[locale.replace('-', '')] || locales['enUS']}
    >
      <DateTimePicker
        {...props}
        invalidDateMessage={texts['INVALID_DATE']}
        maxDateMessage={texts['MAX_DATE']}
        minDateMessage={texts['MIN_DATE']}
        cancelLabel={systemTexts['CANCEL']}
        okLabel={systemTexts['OK']}
        clearLabel={systemTexts['CLEAR']}
        todayLabel={texts['TODAY']}
      />
    </MuiPickersUtilsProvider>
  );
};

export default connect(({ app }: ConnectState) => app)(AppDateTimePicker) as React.FC<AppDateTimePickerProps>;

import { getRoles } from './service';
import { connect } from '../../../../../patches/dva';
import { ConnectState } from '../../../../../models';
import { AppState } from '../../../../../models/app';
import { Dispatch, RoleResponseData } from '../../../../../interfaces';
import { useTexts } from '../../../../../utils/texts';
import AutoComplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';

export interface RoleSelectorProps extends DialogProps {
  submitting?: boolean;
  onCancel?(): void;
  onSelectRoles?(roles: string[]): void;
}
export interface RoleSelectorComponentProps extends AppState, Dispatch, RoleSelectorProps {}

const RoleSelector: React.FC<RoleSelectorComponentProps> = ({
  submitting,
  dispatch,
  onCancel,
  onSelectRoles,
  ...props
}) => {
  const texts = useTexts(dispatch, 'roleSelector');
  const systemTexts = useTexts(dispatch, 'system');
  const [roles, setRoles] = useState<RoleResponseData[]>([]);
  const [rolesLoading, setRolesLoading] = useState<boolean>(false);
  const [selectedRoles, setSelectedRoles] = useState<(RoleResponseData | string)[]>([]);

  const handleGetRoles = () => {
    setRolesLoading(true);
    getRoles().then((roles) => setRoles(roles)).finally(() => setRolesLoading(true));
  };

  useEffect(() => {
    handleGetRoles();
  }, []);

  return (
    <Dialog
      {...props}
      fullWidth={true}
      maxWidth="sm"
    >
      <DialogTitle>{texts['TITLE']}</DialogTitle>
      <DialogContent>
        <AutoComplete
          id="select-roles"
          multiple={true}
          filterSelectedOptions={true}
          limitTags={5}
          value={selectedRoles}
          loading={rolesLoading}
          options={roles}
          loadingText={systemTexts['LOADING']}
          getOptionSelected={(option, value) => {
            if (typeof option === 'string' && typeof value === 'string') {
              return option === value;
            } else {
              return (option as RoleResponseData).id === (value as RoleResponseData).id;
            }
          }}
          getOptionLabel={(role) => (typeof role === 'string' ? role : role.id)}
          renderInput={(autoCompleteProps) => {
            return (
              <TextField
                {...autoCompleteProps}
                fullWidth={true}
                variant="outlined"
                label={texts['SELECT_ROLES']}
              />
            );
          }}
          onChange={(event, data) => {
            setSelectedRoles(data);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="text"
          color="primary"
          disabled={submitting}
          onClick={() => {
            if (_.isFunction(onCancel)) {
              onCancel();
            }
          }}
        >{systemTexts['CANCEL']}</Button>
        <Button
          variant="text"
          color="primary"
          disabled={submitting}
          onClick={() => {
            if (_.isFunction(onSelectRoles)) {
              onSelectRoles(selectedRoles.map((role) => {
                if (typeof role === 'string') {
                  return role;
                } else {
                  return (role as RoleResponseData).id;
                }
              }));
            }
          }}
        >{submitting ? systemTexts['SUBMITTING'] : systemTexts['OK']}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(({ app }: ConnectState) => app)(RoleSelector) as React.FC<RoleSelectorProps>;

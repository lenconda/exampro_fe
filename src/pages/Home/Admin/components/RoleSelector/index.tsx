import { connect } from '../../../../../patches/dva';
import { ConnectState } from '../../../../../models';
import { AppState } from '../../../../../models/app';
import { Dispatch, RoleResponseData } from '../../../../../interfaces';
import { useTexts } from '../../../../../utils/texts';
import RoleAutocomplete from '../RoleAutocomplete';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import React, { useState } from 'react';
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
  const [selectedRoles, setSelectedRoles] = useState<(RoleResponseData | string)[]>([]);

  return (
    <Dialog
      {...props}
      fullWidth={true}
      maxWidth="sm"
    >
      <DialogTitle>{texts['TITLE']}</DialogTitle>
      <DialogContent>
        <RoleAutocomplete
          selectedRoles={selectedRoles}
          onRolesChange={(roles) => {
            setSelectedRoles(roles);
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

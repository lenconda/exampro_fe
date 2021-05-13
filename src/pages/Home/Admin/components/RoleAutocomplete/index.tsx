import { getRoles } from './service';
import { connect } from '../../../../../patches/dva';
import { ConnectState } from '../../../../../models';
import { AppState } from '../../../../../models/app';
import { Dispatch, RoleResponseData } from '../../../../../interfaces';
import { useTexts } from '../../../../../utils/texts';
import AutoComplete, { AutocompleteProps } from '@material-ui/lab/Autocomplete';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';

export interface RoleAutocomplete extends Omit<AutocompleteProps<RoleResponseData, true, false, true>, 'renderInput' | 'options'> {
  selectedRoles?: (RoleResponseData | string)[];
  TextFieldProps?: TextFieldProps;
  onRolesChange?(roleIds: string[]): void;
}
export interface RoleAutocompleteComponentProps extends AppState, Dispatch, RoleAutocomplete {}

const RoleAutocomplete: React.FC<RoleAutocompleteComponentProps> = ({
  selectedRoles = [],
  TextFieldProps = {},
  onRolesChange,
  dispatch,
  ...props
}) => {
  const texts = useTexts(dispatch, 'roleAutocomplete');
  const systemTexts = useTexts(dispatch, 'system');
  const [roles, setRoles] = useState<RoleResponseData[]>([]);
  const [rolesLoading, setRolesLoading] = useState<boolean>(false);

  const handleGetRoles = () => {
    setRolesLoading(true);
    getRoles().then((roles) => setRoles(roles)).finally(() => setRolesLoading(true));
  };

  useEffect(() => {
    handleGetRoles();
  }, []);

  return (
    <AutoComplete
      id="select-roles"
      multiple={true}
      filterSelectedOptions={true}
      fullWidth={true}
      limitTags={5}
      value={selectedRoles}
      loading={rolesLoading}
      options={roles}
      loadingText={systemTexts['LOADING']}
      getOptionSelected={(option, value) => {
        const optionId = typeof option === 'string' ? option : (option as RoleResponseData).id;
        const valueId = typeof value === 'string' ? value : (value as RoleResponseData).id;
        return optionId === valueId;
      }}
      getOptionLabel={(role) => (typeof role === 'string' ? role : role.id)}
      renderInput={(autoCompleteProps) => {
        return (
          <TextField
            {...autoCompleteProps}
            fullWidth={true}
            variant="outlined"
            label={texts['SELECT_ROLES']}
            {...TextFieldProps}
          />
        );
      }}
      onChange={(event, data) => {
        if (_.isFunction(onRolesChange)) {
          onRolesChange((data || []).map((item) => {
            if (typeof item === 'string') {
              return item;
            } else {
              return (item as RoleResponseData).id;
            }
          }));
        }
      }}
      {...(props || {})}
    />
  );
};

export default connect(({ app }: ConnectState) => app)(RoleAutocomplete) as React.FC<RoleAutocomplete>;

import {
  createRole,
  deleteRole,
  getRoles,
} from './service';
import {
  CustomPaginationData,
  Dispatch,
  RoleResponseData,
  RoleTreeItemResponseData,
} from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import { usePageTexts, useTexts } from '../../../../utils/texts';
import AppIndicator from '../../../../components/AppIndicator';
import AppDialogManager from '../../../../components/AppDialog/Manager';
import { pipeRolesListToTree } from '../../../../utils/pipes';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import React, { useEffect, useState } from 'react';
import { lighten, makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';
import AnchorIcon from 'mdi-material-ui/Anchor';
import DeleteOutlineIcon from 'mdi-material-ui/DeleteOutline';
import MinusBoxOutlineIcon from 'mdi-material-ui/MinusBoxOutline';
import PlusBoxOutlineIcon from 'mdi-material-ui/PlusBoxOutline';
import _ from 'lodash';
import clsx from 'clsx';

export interface RolePageProps extends Dispatch, AppState {}
export type UserPaginationData = CustomPaginationData;
export type UserRolePaginationData = CustomPaginationData;

const ROOT_NODE_ORIGINAL_ID = '__root';

const generateRootNode = (
  texts: Record<string, any>,
  children: RoleTreeItemResponseData[] = [],
): RoleTreeItemResponseData => {
  return {
    originalId: ROOT_NODE_ORIGINAL_ID,
    id: texts['001'],
    children,
  };
};

const useStyles = makeStyles((theme) => {
  return {
    wrapper: {
      padding: theme.spacing(2),
    },
    sectionWrapper: {
      maxHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'nowrap',
    },
    container: {
      flexWrap: 'nowrap',
      '& > MuiGrid-item': {
        height: '100%',
      },
    },
    buttonsWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    infoItemWrapper: {
      marginBottom: theme.spacing(3),
      display: 'flex',
      alignItems: 'stretch',
      '& > button': {
        marginRight: theme.spacing(1),
      },
    },
    tabsWrapper: {
      marginBottom: theme.spacing(3),
    },
    deleteButton: {
      color: theme.palette.error.main,
    },
    tableContainer: {
      padding: 0,
    },
    userItem: {
      userSelect: 'none',
      cursor: 'pointer',
      borderRadius: 0,
    },
    userItemSelected: {
      backgroundColor: lighten(theme.palette.primary.main, 0.85),
    },
    treeItemContent: {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      borderRadius: theme.spacing(0.5),
    },
    treeItemIconContainer: {
      opacity: 0.5,
    },
    sectionButtonsWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      '& button': {
        marginRight: theme.spacing(1),
      },
      '& button:last-child': {
        marginRight: 0,
      },
    },
    treeViewWrapper: {
      overflow: 'scroll',
    },
  };
});

const RolePage: React.FC<RolePageProps> = ({
  dispatch,
}) => {
  const classes = useStyles();
  const texts = usePageTexts(dispatch, '/home/admin/role');
  const systemTexts = useTexts(dispatch, 'system');
  const [roles, setRoles] = useState<RoleResponseData[]>([]);
  const [rolesTree, setRolesTree] = useState<RoleTreeItemResponseData>(undefined);
  const [rolesLoading, setRolesLoading] = useState<boolean>(false);
  const [selectedRoleTreeItem, setSelectedRoleTreeItem] = useState<RoleTreeItemResponseData>(undefined);
  const [createRoleId, setCreateRoleId] = useState<string>('');
  const [createRoleLoading, setCreateRoleLoading] = useState<boolean>(false);
  const [createRoleOpen, setCreateRoleOpen] = useState<boolean>(false);
  const [deleteRoleLoading, setDeleteRoleLoading] = useState<boolean>(false);

  const renderTree = (treeNode: RoleTreeItemResponseData) => {
    return (
      <TreeItem
        key={treeNode.originalId}
        nodeId={treeNode.originalId}
        label={treeNode.id}
        classes={{
          label: classes.treeItemContent,
          iconContainer: classes.treeItemIconContainer,
        }}
        onClick={() => setSelectedRoleTreeItem(treeNode)}
      >
        {
          _.isArray(treeNode.children)
            ? treeNode.children.map((node) => renderTree(node))
            : null
        }
      </TreeItem>
    );
  };

  const handleGetRoles = () => {
    setRolesLoading(true);
    getRoles().then((roles) => {
      setRoles(roles);
    }).finally(() => setRolesLoading(false));
  };

  const handleCreateRole = (parentRoleId: string, roleId: string) => {
    if (!_.isString(roleId) || !_.isString(parentRoleId)) {
      return;
    }
    const currentRoleId = parentRoleId === ROOT_NODE_ORIGINAL_ID ? roleId : `${parentRoleId}/${roleId}`;
    setCreateRoleLoading(true);
    createRole(currentRoleId).then(() => {
      handleGetRoles();
    }).finally(() => {
      setCreateRoleId('');
      setCreateRoleLoading(false);
      setCreateRoleOpen(false);
    });
  };

  const handleDeleteRole = (regexString: string) => {
    setDeleteRoleLoading(true);
    deleteRole(regexString).finally(() => {
      setSelectedRoleTreeItem(undefined);
      setDeleteRoleLoading(false);
      handleGetRoles();
    });
  };

  useEffect(() => {
    handleGetRoles();
  }, []);

  useEffect(() => {
    if (_.isArray(roles) && roles.length > 0 && texts) {
      setRolesTree(generateRootNode(texts, pipeRolesListToTree(roles)));
    }
  }, [roles, texts]);

  return (
    <div className="app-page app-page-admin__role">
      <div className={clsx('app-grid-container', classes.container)}>
        {
          rolesLoading
            ? <AppIndicator type="loading" />
            : !rolesTree
              ? <AppIndicator type="empty" />
              : (
                <Card classes={{ root: clsx(classes.sectionWrapper) }}>
                  <Box className={clsx(classes.sectionButtonsWrapper, classes.wrapper)}>
                    <Box>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        disabled={!selectedRoleTreeItem}
                        startIcon={<AnchorIcon />}
                        onClick={() => setCreateRoleOpen(true)}
                      >{texts['002']}</Button>
                      <Button
                        size="small"
                        disabled={!selectedRoleTreeItem || deleteRoleLoading}
                        startIcon={<DeleteOutlineIcon />}
                        classes={{ root: classes.deleteButton }}
                        onClick={() => {
                          AppDialogManager.confirm(texts['005'], {
                            onConfirm: () => {
                              handleDeleteRole(selectedRoleTreeItem.originalId);
                            },
                          });
                        }}
                      >{deleteRoleLoading ? systemTexts['DELETING'] : systemTexts['DELETE']}</Button>
                    </Box>
                  </Box>
                  <TreeView
                    defaultCollapseIcon={<MinusBoxOutlineIcon />}
                    defaultExpandIcon={<PlusBoxOutlineIcon />}
                    defaultEndIcon={<AnchorIcon />}
                    defaultExpanded={['__root']}
                    classes={{ root: clsx(classes.wrapper, classes.treeViewWrapper) }}
                  >
                    {renderTree(rolesTree)}
                  </TreeView>
                </Card>
              )
        }
      </div>
      <Dialog
        open={createRoleOpen}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle>{texts['002']}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth={true}
            variant="outlined"
            label={texts['006']}
            value={createRoleId}
            onChange={(event) => setCreateRoleId(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            color="primary"
            disabled={createRoleLoading}
            onClick={() => {
              setCreateRoleId('');
              setCreateRoleOpen(false);
            }}
          >{systemTexts['CANCEL']}</Button>
          <Button
            variant="text"
            color="primary"
            disabled={createRoleLoading}
            onClick={() => {
              handleCreateRole(selectedRoleTreeItem.originalId, createRoleId);
            }}
          >{createRoleLoading ? systemTexts['SUBMITTING'] : systemTexts['OK']}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(RolePage);

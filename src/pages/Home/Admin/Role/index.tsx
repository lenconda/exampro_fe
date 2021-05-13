import {
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
import Grid from '@material-ui/core/Grid';
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

const generateRootNode = (
  texts: Record<string, any>,
  children: RoleTreeItemResponseData[] = [],
): RoleTreeItemResponseData => {
  return {
    originalId: '__root',
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
  const tableTexts = useTexts(dispatch, 'table');
  const systemTexts = useTexts(dispatch, 'system');
  const [roles, setRoles] = useState<RoleResponseData[]>([]);
  const [rolesTree, setRolesTree] = useState<RoleTreeItemResponseData>(undefined);
  const [rolesLoading, setRolesLoading] = useState<boolean>(false);
  const [selectedRoleTreeItem, setSelectedRoleTreeItem] = useState<RoleTreeItemResponseData>(undefined);

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
      >
        {
          _.isArray(treeNode.children)
            ? treeNode.children.map((node) => renderTree(node))
            : null
        }
      </TreeItem>
    );
  };

  const handleGetRolesTree = () => {
    setRolesLoading(true);
    getRoles().then((roles) => {
      setRoles(roles);
    }).finally(() => setRolesLoading(false));
  };

  useEffect(() => {
    handleGetRolesTree();
  }, []);

  useEffect(() => {
    if (_.isArray(roles) && roles.length > 0 && texts) {
      setRolesTree(generateRootNode(texts, pipeRolesListToTree(roles)));
    }
  }, [roles, texts]);

  return (
    <div className="app-page app-page-admin__role">
      <Grid
        container={true}
        spacing={3}
        classes={{ container: clsx('app-grid-container', classes.container) }}
      >
        <>
          <Grid
            item={true}
            xs={12}
            sm={12}
            md={6}
            lg={5}
            xl={4}
          >
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
                            variant="outlined"
                            size="small"
                            startIcon={<AnchorIcon />}
                          >{texts['002']}</Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DeleteOutlineIcon />}
                            classes={{ root: classes.deleteButton }}
                          >{systemTexts['DELETE']}</Button>
                        </Box>
                        <Box>
                          <Button
                            variant="outlined"
                            size="small"
                          >{systemTexts['SAVE']}</Button>
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
          </Grid>
          <Grid
            item={true}
            xs={12}
            sm={12}
            md={6}
            lg={7}
            xl={8}
          >
            {/* <Card>
              {
                !selectedRoleTreeItem
                  ? <Typography style={{ textAlign: 'center' }}>{texts['002']}</Typography>
                  : (
                    <>
                      <Box>
                        <Box className={classes.infoItemWrapper}>
                          <Avatar src={selectedUser.avatar} />
                        </Box>
                        <Box className={classes.infoItemWrapper}>
                          <Typography>{texts['006']}:&nbsp;{selectedUser.email}</Typography>
                        </Box>
                        <Box className={classes.infoItemWrapper}>
                          <Typography>{texts['007']}:&nbsp;{selectedUser.name || selectedUser.email.split('@')[0]}</Typography>
                        </Box>
                        <Box className={classes.infoItemWrapper}>
                          <Typography>{texts['008']}:&nbsp;{new Date(selectedUser.createdAt).toLocaleString()}</Typography>
                        </Box>
                      </Box>
                    </>
                  )
              }
            </Card> */}
          </Grid>
        </>
      </Grid>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(RolePage);

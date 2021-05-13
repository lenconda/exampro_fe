import { deleteUserRoles, grantUserRoles, queryAllUsers, queryUserRoles } from './service';
import {
  CustomPaginationData,
  Dispatch,
  PaginationResponse,
  User,
  UserRoleResponseData,
} from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import { usePageTexts, useTexts } from '../../../../utils/texts';
import AppIndicator from '../../../../components/AppIndicator';
import AppDialogManager from '../../../../components/AppDialog/Manager';
import AppTable, { TableSchema } from '../../../../components/AppTable';
import RoleSelector from '../components/RoleSelector';
import AppUserCard from '../../../../components/AppUserCard';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import React, { useEffect, useState } from 'react';
import { lighten, makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/CardActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TablePagination from '@material-ui/core/TablePagination';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AccountPlusOutlineIcon from 'mdi-material-ui/AccountPlusOutline';
import _ from 'lodash';
import clsx from 'clsx';

export interface UserPageProps extends Dispatch, AppState {}
export type UserPaginationData = CustomPaginationData;
export type UserRolePaginationData = CustomPaginationData;

const tabs = ['BASIC', 'ROLES'];
const defaultUserRolesPaginationData: UserRolePaginationData = {
  page: 1,
  size: 10,
};
const defaultUsersPaginationData: UserPaginationData = {
  page: 1,
  size: 10,
};

const useStyles = makeStyles((theme) => {
  return {
    sectionWrapper: {
      padding: theme.spacing(2),
      maxHeight: '100%',
      overflowY: 'scroll',
    },
    usersWrapper: {
      padding: 0,
      overflowX: 'scroll',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
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
  };
});

const UserPage: React.FC<UserPageProps> = ({
  dispatch,
}) => {
  const classes = useStyles();
  const texts = usePageTexts(dispatch, '/home/admin/user');
  const tableTexts = useTexts(dispatch, 'table');
  const systemTexts = useTexts(dispatch, 'system');
  const [usersData, setUsersData] = useState<PaginationResponse<User>>({
    items: [],
    total: 0,
  });
  const [userRolesData, setUserRolesData] = useState<PaginationResponse<UserRoleResponseData>>({
    items: [],
    total: 0,
  });
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [userRolesLoading, setUserRolesLoading] = useState<boolean>(false);
  const [usersPagination, setUsersPagination] = useState<UserPaginationData>(_.clone(defaultUsersPaginationData));
  const [userRolesPagination, setUserRolesPagination] = useState<UserPaginationData>(_.clone(defaultUserRolesPaginationData));
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [selectedUser, setSelectedUser] = useState<User>(undefined);
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [roleSelectorOpen, setRoleSelectorOpen] = useState<boolean>(false);
  const [grantUserRolesLoading, setGrantUserRolesLoading] = useState<boolean>(false);

  const handleQueryAllUsers = (pagination: UserPaginationData) => {
    setUsersLoading(true);
    queryAllUsers(pagination).then((data) => setUsersData(data)).finally(() => setUsersLoading(false));
  };

  const handleQueryUserRoles = (email: string, pagination: UserRolePaginationData) => {
    if (_.isString(email)) {
      setUserRolesLoading(true);
      queryUserRoles(email, pagination).then((data) => {
        setUserRolesData(data);
      }).finally(() => setUserRolesLoading(false));
    }
  };

  const handleGrantUserRoles = (email: string, roleIds: string[]) => {
    if (_.isString(email) && roleIds.length > 0) {
      setGrantUserRolesLoading(true);
      grantUserRoles([email], roleIds).finally(() => {
        setRoleSelectorOpen(false);
        setGrantUserRolesLoading(false);
        handleQueryUserRoles(selectedUser.email, userRolesPagination);
      });
    }
  };

  useEffect(() => {
    if (!_.isEmpty(systemTexts) && !_.isEmpty(texts)) {
      setSchema([
        {
          title: texts['003'],
          key: 'id',
          render: (row, value) => {
            return _.get(row, 'role.id');
          },
        },
        {
          title: texts['004'],
          key: 'createdAt',
          minWidth: 160,
          render: (row, value) => new Date(value).toLocaleString(),
        },
        {
          title: systemTexts['OPERATIONS'],
          key: 'id',
          render: (row) => {
            return (
              <Button
                size="small"
                color="primary"
                onClick={() => {
                  AppDialogManager.confirm(texts['005'], {
                    onConfirm: () => {
                      const userEmail = _.get(selectedUser, 'email');
                      if (_.isString(userEmail)) {
                        deleteUserRoles([userEmail], [_.get(row, 'role.id')]).then(() => {
                          handleQueryUserRoles(userEmail, userRolesPagination);
                        });
                      }
                    },
                  });
                }}
              >{systemTexts['REVOKE']}</Button>
            );
          },
        },
      ]);
    }
  }, [texts, systemTexts, usersData, selectedUser]);

  useEffect(() => {
    handleQueryAllUsers(usersPagination);
  }, [usersPagination]);

  useEffect(() => {
    if (selectedUser && selectedUser.email) {
      handleQueryUserRoles(selectedUser.email, userRolesPagination);
    }
  }, [selectedUser]);

  return (
    <div className="app-page app-page-admin__user">
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
              usersLoading
                ? <AppIndicator type="loading" />
                : usersData && usersData.items.length === 0
                  ? <AppIndicator type="empty" />
                  : (
                    <Card classes={{ root: clsx(classes.sectionWrapper, classes.usersWrapper) }}>
                      <CardContent classes={{ root: classes.buttonsWrapper }}>
                        <Button
                          startIcon={<AccountPlusOutlineIcon />}
                          color="primary"
                          variant="contained"
                          size="small"
                        >{texts['001']}</Button>
                      </CardContent>
                      {
                        usersData.items.map((item) => {
                          return (
                            <AppUserCard
                              key={item.email}
                              user={item}
                              classes={{
                                root: clsx(classes.userItem, {
                                  [classes.userItemSelected]: selectedUser && selectedUser.email === item.email,
                                }),
                              }}
                              onClick={() => setSelectedUser(item)}
                            />
                          );
                        })
                      }
                      <TablePagination
                        count={usersData.total}
                        page={(usersPagination.page || 1) - 1}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        rowsPerPage={usersPagination.size || 10}
                        labelRowsPerPage={tableTexts['001']}
                        backIconButtonText={tableTexts['002']}
                        nextIconButtonText={tableTexts['003']}
                        labelDisplayedRows={({ from, to, count }) => `${count} ${tableTexts['004']} ${from}-${to}`}
                        onChangePage={(event, newPageNumber) => {
                          setUsersPagination({
                            ...usersPagination,
                            page: newPageNumber + 1,
                          });
                        }}
                        onChangeRowsPerPage={(event) => {
                          setUsersPagination({
                            ...usersPagination,
                            size: parseInt(event.target.value, 10),
                            page: 1,
                          });
                        }}
                      />
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
            <Card classes={{ root: classes.sectionWrapper }}>
              {
                (!selectedUser)
                  ? <Typography style={{ textAlign: 'center' }}>{texts['002']}</Typography>
                  : (
                    <>
                      <Tabs
                        value={selectedTabIndex}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        classes={{ root: classes.tabsWrapper }}
                        onChange={(event, newIndex) => setSelectedTabIndex(newIndex)}
                      >
                        {
                          tabs.map((tabName, index) => {
                            return (
                              <Tab key={index} label={texts[tabName]} />
                            );
                          })
                        }
                      </Tabs>
                      {
                        tabs[selectedTabIndex] === 'BASIC' && (
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
                        )
                      }
                      {
                        tabs[selectedTabIndex] === 'ROLES' && (
                          <>
                            <Box className={classes.infoItemWrapper}>
                              <Button
                                variant="outlined"
                                onClick={() => setRoleSelectorOpen(true)}
                              >{systemTexts['GRANT']}</Button>
                            </Box>
                            <AppTable
                              schema={schema}
                              data={userRolesData.items || []}
                              loading={userRolesLoading}
                              containerClassName={classes.tableContainer}
                              selectable={false}
                              collapseHeight={185}
                              PaperProps={{
                                elevation: 0,
                              }}
                              TablePaginationProps={{
                                count: userRolesData.total,
                                page: (userRolesPagination.page || 1) - 1,
                                rowsPerPage: userRolesPagination.size || 10,
                                onChangePage: (event, newPageNumber) => {
                                  setUserRolesPagination({
                                    ...userRolesPagination,
                                    page: newPageNumber + 1,
                                  });
                                },
                                onChangeRowsPerPage: (event) => {
                                  setUserRolesPagination({
                                    ...userRolesPagination,
                                    size: parseInt(event.target.value, 10),
                                    page: 1,
                                  });
                                },
                              }}
                            />
                          </>
                        )
                      }
                    </>
                  )
              }
            </Card>
          </Grid>
        </>
      </Grid>
      {/* <Dialog
        open={createMenuItemOpen}
        scroll="paper"
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle>{texts['003']}</DialogTitle>
        <DialogContent>
          <Box className={classes.infoItemWrapper}>
            <TextField
              variant="outlined"
              fullWidth={true}
              label={texts['004']}
              value={createMenuData.title}
              onChange={(event) => {
                setCreateMenuData({
                  ...createMenuData,
                  title: event.target.value,
                });
              }}
            />
          </Box>
          <Box className={classes.infoItemWrapper}>
            <TextField
              variant="outlined"
              fullWidth={true}
              label={texts['005']}
              value={createMenuData.icon}
              onChange={(event) => {
                setCreateMenuData({
                  ...createMenuData,
                  icon: event.target.value,
                });
              }}
            />
            {
              icons[createMenuData.icon] && (
                <Box className={classes.createMenuInfoIconWrapper}>
                  <SvgIcon component={icons[createMenuData.icon]} />
                </Box>
              )
            }
          </Box>
          <Box className={classes.infoItemWrapper}>
            <TextField
              variant="outlined"
              fullWidth={true}
              label={texts['006']}
              value={createMenuData.pathname}
              onChange={(event) => {
                setCreateMenuData({
                  ...createMenuData,
                  pathname: event.target.value,
                });
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'flex-end' }}>
          <Button
            color="primary"
            disabled={createMenuLoading}
            onClick={closeCreateMenuDialog}
          >{systemTexts['CANCEL']}</Button>
          <Button
            color="primary"
            disabled={!validateCreateMenuData(createMenuData) || createMenuLoading}
            // onClick={() => createNewMenuItem(createMenuData)}
          >{systemTexts['SUBMIT']}</Button>
        </DialogActions>
      </Dialog> */}
      <RoleSelector
        open={roleSelectorOpen}
        submitting={grantUserRolesLoading}
        onCancel={() => {
          setRoleSelectorOpen(false);
        }}
        onSelectRoles={(roleIds) => {
          handleGrantUserRoles(_.get(selectedUser, 'email'), roleIds);
        }}
      />
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(UserPage);

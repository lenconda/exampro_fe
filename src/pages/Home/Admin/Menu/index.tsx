import {
  batchUpdateMenuItems,
  createMenu,
  deleteMenuItems,
  deleteMenuRoles,
  getFlattenedMenuTree,
  getMoveLevelDirectionPermission,
  grantMenuRole,
  queryMenuRoles,
} from './service';
import {
  CustomPaginationData,
  Dispatch,
  MenuItemRequestData,
  MenuRoleResponseData,
  MenuTreeItemLevelPermission,
  MenuTreeItemMetadata,
  PaginationResponse,
} from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import { usePageTexts, useTexts } from '../../../../utils/texts';
import AppIndicator from '../../../../components/AppIndicator';
import AppDialogManager from '../../../../components/AppDialog/Manager';
import AppTable, { TableSchema } from '../../../../components/AppTable';
import RoleSelector from '../components/RoleSelector';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import React, { useEffect, useRef, useState } from 'react';
import { lighten, makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/CardActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import SvgIcon from '@material-ui/core/SvgIcon';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import * as icons from 'mdi-material-ui';
import ArrowCollapseLeftIcon from 'mdi-material-ui/ArrowCollapseLeft';
import ArrowCollapseRightIcon from 'mdi-material-ui/ArrowCollapseRight';
import LinkPlusIcon from 'mdi-material-ui/LinkPlus';
import _ from 'lodash';
import clsx from 'clsx';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';

export interface ProfilePageProps extends Dispatch, AppState {}
export type MenuRolePaginationData = CustomPaginationData;

const defaultCreateMenuRequestData: MenuItemRequestData = {
  title: '',
  pathname: '',
  icon: '',
};
const menuInfoTabs = ['BASIC', 'ROLES'];
const defaultMenuRolePaginationData: MenuRolePaginationData = {
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
    menuWrapper: {
      padding: 0,
      overflowX: 'scroll',
    },
    container: {
      flexWrap: 'nowrap',
      '& > MuiGrid-item': {
        height: '100%',
      },
    },
    menuTreeItem: {
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5),
      backgroundColor: 'white',
      '& > svg': {
        marginRight: theme.spacing(2),
      },
    },
    menuTreeItemSelected: {
      backgroundColor: lighten(theme.palette.primary.main, 0.85),
    },
    menuButtonsWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    createMenuInfoItemWrapper: {
      marginBottom: theme.spacing(3),
      display: 'flex',
      alignItems: 'stretch',
      '& > button': {
        marginRight: theme.spacing(1),
      },
    },
    createMenuInfoIconWrapper: {
      height: '100%',
      padding: theme.spacing(2),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: '1px solid transparent',
      borderColor: theme.palette.grey[400],
      marginLeft: theme.spacing(3),
    },
    tabsWrapper: {
      marginBottom: theme.spacing(3),
    },
    deleteButton: {
      color: theme.palette.error.main,
    },
    menuRolesTableContainer: {
      padding: 0,
    },
  };
});

const ProfilePage: React.FC<ProfilePageProps> = ({
  dispatch,
}) => {
  const classes = useStyles();
  const texts = usePageTexts(dispatch, '/home/admin/menu');
  const systemTexts = useTexts(dispatch, 'system');
  const [menuTreeItems, setMenuTreeItems] = useState<MenuTreeItemMetadata[]>([]);
  const [menuTreeItemsLoading, setMenuTreeItemsLoading] = useState<boolean>(false);
  const [selectedMenuTreeItemIndex, setSelectedMenuTreeItemIndex] = useState<number>(undefined);
  const [updateMenuTreeItemsLoading, setUpdateMenuTreeItemsLoading] = useState<boolean>(false);
  const [createMenuItemOpen, setCreateMenuItemOpen] = useState<boolean>(false);
  const [createMenuData, setCreateMenuData] = useState<MenuItemRequestData>(_.clone(defaultCreateMenuRequestData));
  const [createMenuLoading, setCreateMenuLoading] = useState<boolean>(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [selectedMenuTreeItemMovePermission, setSelectedMenuTreeItemMovePermission] = useState<MenuTreeItemLevelPermission>({
    left: false,
    right: false,
  });
  const [deleteMenuItemLoading, setDeleteMenuItemLoading] = useState<boolean>(false);
  const [menuRolePagination, setMenuRolePagination] = useState<MenuRolePaginationData>(_.clone(defaultMenuRolePaginationData));
  const [queryMenuRolesLoading, setQueryMenuRolesLoading] = useState<boolean>(false);
  const [menuRoles, setMenuRoles] = useState<PaginationResponse<MenuRoleResponseData>>({
    items: [],
    total: 0,
  });
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const menuRoleCardRef = useRef<HTMLElement>(undefined);
  const [roleSelectorOpen, setRoleSelectorOpen] = useState<boolean>(false);
  const [grantMenuRolesLoading, setGrantMenuRolesLoading] = useState<boolean>(false);

  const validateCreateMenuData = (data: MenuItemRequestData) => {
    for (const key of Object.keys(data)) {
      if (!data[key]) {
        return false;
      }
    }
    return true;
  };

  const closeCreateMenuDialog = () => {
    setCreateMenuItemOpen(false);
    setCreateMenuData(_.clone(defaultCreateMenuRequestData));
  };

  const fetchFlattenedMenuTree = () => {
    setMenuTreeItemsLoading(true);
    getFlattenedMenuTree().then((menuTree) => {
      setMenuTreeItems(menuTree);
    }).finally(() => setMenuTreeItemsLoading(false));
  };

  const updateMenuItems = (menuTreeItems: MenuTreeItemMetadata[]) => {
    setUpdateMenuTreeItemsLoading(true);
    batchUpdateMenuItems(menuTreeItems).finally(() => setUpdateMenuTreeItemsLoading(false));
  };

  const createNewMenuItem = (createMenuData: MenuItemRequestData) => {
    setCreateMenuLoading(true);
    createMenu({ ...createMenuData, order: menuTreeItems.length + 1 }).then(() => {
      closeCreateMenuDialog();
      fetchFlattenedMenuTree();
    }).catch(() => {}).finally(() => setCreateMenuLoading(false));
  };

  const reorderMenuTreeItems = (
    list: MenuTreeItemMetadata[],
    startIndex: number,
    endIndex: number,
  ): MenuTreeItemMetadata[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex - 1, 1);
    result.splice(endIndex - 1, 0, removed);
    return result;
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || !source) {
      return;
    }
    const selectedMenuItem = menuTreeItems[selectedMenuTreeItemIndex];
    const currentMenuTree = reorderMenuTreeItems(Array.from(menuTreeItems), source.index, destination.index);
    if (selectedMenuItem) {
      const newSelectedMenuItemIndex = currentMenuTree.findIndex((currentTreeNode) => {
        return currentTreeNode.id === selectedMenuItem.id;
      });
      if (newSelectedMenuItemIndex !== -1) {
        setSelectedMenuTreeItemIndex(newSelectedMenuItemIndex);
      } else {
        setSelectedMenuTreeItemIndex(undefined);
      }
    }
    setMenuTreeItems(currentMenuTree.map((treeNode, index) => {
      return {
        ...treeNode,
        order: index + 1,
      };
    }));
  };

  const handleMoveLevel = (direction: 'left' | 'right') => {
    if (selectedMenuTreeItemMovePermission[direction]) {
      setMenuTreeItems(menuTreeItems.map((item, index) => {
        if (index === selectedMenuTreeItemIndex) {
          return {
            ...item,
            level: direction === 'left' ? item.level - 1 : item.level + 1,
          };
        }
        return item;
      }));
    }
  };

  const handleDeleteMenuItem = (menuId: number) => {
    setDeleteMenuItemLoading(true);
    deleteMenuItems(menuId).then(() => {
      fetchFlattenedMenuTree();
      setSelectedMenuTreeItemIndex(0);
    }).finally(() => setDeleteMenuItemLoading(false));
  };

  const handleQueryMenuRoles = (pagination: MenuRolePaginationData, id: number) => {
    setQueryMenuRolesLoading(true);
    queryMenuRoles(id, pagination).then((data) => {
      setMenuRoles(data);
    }).finally(() => setQueryMenuRolesLoading(false));
  };

  const handleGrantMenuRoles = (menuId: number, roleIds: string[]) => {
    if (_.isNumber(menuId) && roleIds.length > 0) {
      setGrantMenuRolesLoading(true);
      grantMenuRole([menuId], roleIds).finally(() => {
        setRoleSelectorOpen(false);
        setGrantMenuRolesLoading(false);
        handleQueryMenuRoles(menuRolePagination, _.get(menuTreeItems[selectedMenuTreeItemIndex], 'id'));
      });
    }
  };

  useEffect(() => {
    if (!_.isEmpty(systemTexts) && !_.isEmpty(texts)) {
      setSchema([
        {
          title: texts['008'],
          key: 'id',
          render: (row, value) => {
            return _.get(row, 'role.id');
          },
        },
        {
          title: texts['009'],
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
                  AppDialogManager.confirm(texts['010'], {
                    onConfirm: () => {
                      const menuItemId = _.get(menuTreeItems[selectedMenuTreeItemIndex], 'id');
                      if (_.isNumber(menuItemId)) {
                        deleteMenuRoles([menuItemId], [_.get(row, 'role.id')]).then(() => {
                          handleQueryMenuRoles(menuRolePagination, menuItemId);
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
  }, [texts, systemTexts, menuTreeItems, selectedMenuTreeItemIndex]);

  useEffect(() => {
    fetchFlattenedMenuTree();
  }, []);

  useEffect(() => {
    if (menuTreeItems && !_.isNumber(selectedMenuTreeItemIndex)) {
      setSelectedMenuTreeItemIndex(0);
    }
  }, [selectedMenuTreeItemIndex, menuTreeItems]);

  useEffect(() => {
    if (_.isNumber(selectedMenuTreeItemIndex) && menuTreeItems) {
      setSelectedMenuTreeItemMovePermission(getMoveLevelDirectionPermission(menuTreeItems, selectedMenuTreeItemIndex));
    }
  }, [menuTreeItems, selectedMenuTreeItemIndex]);

  useEffect(() => {
    const selectedMenuTreeItem = menuTreeItems[selectedMenuTreeItemIndex];
    if (selectedMenuTreeItem) {
      handleQueryMenuRoles(menuRolePagination, selectedMenuTreeItem.id);
    }
  }, [menuRolePagination, selectedMenuTreeItemIndex, menuTreeItems]);

  return (
    <div className="app-page app-page-admin__menu">
      <Grid
        container={true}
        spacing={3}
        classes={{ container: clsx('app-grid-container', classes.container) }}
      >
        {
          menuTreeItemsLoading
            ? <AppIndicator type="loading" />
            : menuTreeItems && menuTreeItems.length === 0
              ? <AppIndicator type="empty" />
              : (
                <>
                  <Grid
                    item={true}
                    xs={12}
                    sm={12}
                    md={6}
                    lg={5}
                    xl={4}
                  >
                    <Card classes={{ root: clsx(classes.sectionWrapper, classes.menuWrapper) }}>
                      <CardContent classes={{ root: classes.menuButtonsWrapper }}>
                        <Button
                          startIcon={<LinkPlusIcon />}
                          color="primary"
                          variant="contained"
                          size="small"
                          onClick={() => setCreateMenuItemOpen(true)}
                        >{texts['001']}</Button>
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={updateMenuTreeItemsLoading}
                          onClick={() => updateMenuItems(menuTreeItems)}
                        >{updateMenuTreeItemsLoading ? systemTexts['SAVING'] : systemTexts['SAVE']}</Button>
                      </CardContent>
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="menu-tree">
                          {
                            (provided) => {
                              return (
                                <div ref={provided.innerRef}>
                                  {
                                    menuTreeItems.map((treeItem, index) => {
                                      const Icon = icons[treeItem.icon];
                                      return (
                                        <Draggable key={index} index={index + 1} draggableId={index.toString()}>
                                          {
                                            (provided, snapshot) => {
                                              return (
                                                <Paper
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                  elevation={snapshot.isDragging ? 9 : 0}
                                                  onClick={() => {
                                                    setSelectedMenuTreeItemIndex(index);
                                                  }}
                                                >
                                                  <MenuItem
                                                    classes={{
                                                      root: clsx(classes.menuTreeItem, {
                                                        [classes.menuTreeItemSelected]: _.isNumber(selectedMenuTreeItemIndex)
                                                          && menuTreeItems[selectedMenuTreeItemIndex]
                                                          && menuTreeItems[selectedMenuTreeItemIndex].id === treeItem.id,
                                                      }),
                                                    }}
                                                    style={{
                                                      paddingLeft: 16 + 16 * treeItem.level,
                                                    }}
                                                  >
                                                    {
                                                      Icon && <Icon fontSize="small" />
                                                    }
                                                    <Typography noWrap={true}>{treeItem.pathname}</Typography>
                                                  </MenuItem>
                                                </Paper>
                                              );
                                            }
                                          }
                                        </Draggable>
                                      );
                                    })
                                  }
                                  {provided.placeholder}
                                </div>
                              );
                            }
                          }
                        </Droppable>
                      </DragDropContext>
                    </Card>
                  </Grid>
                  <Grid
                    item={true}
                    xs={12}
                    sm={12}
                    md={6}
                    lg={7}
                    xl={8}
                  >
                    <Card classes={{ root: classes.sectionWrapper }} ref={menuRoleCardRef}>
                      {
                        (!_.isNumber(selectedMenuTreeItemIndex) && menuTreeItems[selectedMenuTreeItemIndex])
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
                                  menuInfoTabs.map((tabName, index) => {
                                    return (
                                      <Tab key={index} label={texts[tabName]} />
                                    );
                                  })
                                }
                              </Tabs>
                              {
                                menuInfoTabs[selectedTabIndex] === 'BASIC' && (
                                  <Box>
                                    <Box className={classes.createMenuInfoItemWrapper}>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<ArrowCollapseLeftIcon fontSize="small" />}
                                        disabled={!selectedMenuTreeItemMovePermission.left}
                                        onClick={() => handleMoveLevel('left')}
                                      >{texts['MOVE_LEFT']}</Button>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<ArrowCollapseRightIcon fontSize="small" />}
                                        disabled={!selectedMenuTreeItemMovePermission.right}
                                        onClick={() => handleMoveLevel('right')}
                                      >{texts['MOVE_RIGHT']}</Button>
                                    </Box>
                                    <Box className={classes.createMenuInfoItemWrapper}>
                                      <Typography>{texts['004']}:&nbsp;{menuTreeItems[selectedMenuTreeItemIndex].title}</Typography>
                                    </Box>
                                    <Box className={classes.createMenuInfoItemWrapper}>
                                      <TextField
                                        variant="outlined"
                                        fullWidth={true}
                                        label={texts['005']}
                                        value={menuTreeItems[selectedMenuTreeItemIndex].icon}
                                        onChange={(event) => {
                                          setMenuTreeItems(menuTreeItems.map((treeItem, index) => {
                                            if (index === selectedMenuTreeItemIndex) {
                                              return {
                                                ...treeItem,
                                                icon: event.target.value,
                                              };
                                            } else {
                                              return treeItem;
                                            }
                                          }));
                                        }}
                                      />
                                    </Box>
                                    <Box className={classes.createMenuInfoItemWrapper}>
                                      <TextField
                                        variant="outlined"
                                        fullWidth={true}
                                        label={texts['006']}
                                        value={menuTreeItems[selectedMenuTreeItemIndex].pathname}
                                        onChange={(event) => {
                                          setMenuTreeItems(menuTreeItems.map((treeItem, index) => {
                                            if (index === selectedMenuTreeItemIndex) {
                                              return {
                                                ...treeItem,
                                                pathname: event.target.value,
                                              };
                                            } else {
                                              return treeItem;
                                            }
                                          }));
                                        }}
                                      />
                                    </Box>
                                    <Box className={classes.createMenuInfoItemWrapper}>
                                      <Button
                                        classes={{ root: classes.deleteButton }}
                                        variant="outlined"
                                        disabled={deleteMenuItemLoading}
                                        onClick={() => {
                                          AppDialogManager.confirm(texts['007'], {
                                            onConfirm: () => {
                                              handleDeleteMenuItem(_.get(menuTreeItems[selectedMenuTreeItemIndex], 'id'));
                                            },
                                          });
                                        }}
                                      >{systemTexts['DELETE']}</Button>
                                    </Box>
                                  </Box>
                                )
                              }
                              {
                                menuInfoTabs[selectedTabIndex] === 'ROLES' && (
                                  <>
                                    <Box className={classes.createMenuInfoItemWrapper}>
                                      <Button
                                        variant="outlined"
                                        onClick={() => setRoleSelectorOpen(true)}
                                      >{systemTexts['GRANT']}</Button>
                                    </Box>
                                    <AppTable
                                      schema={schema}
                                      data={menuRoles.items || []}
                                      loading={queryMenuRolesLoading}
                                      containerClassName={classes.menuRolesTableContainer}
                                      selectable={false}
                                      collapseHeight={185}
                                      PaperProps={{
                                        elevation: 0,
                                      }}
                                      TablePaginationProps={{
                                        count: menuRoles.total,
                                        page: (menuRolePagination.page || 1) - 1,
                                        rowsPerPage: menuRolePagination.size || 10,
                                        onChangePage: (event, newPageNumber) => {
                                          setMenuRolePagination({
                                            ...menuRolePagination,
                                            page: newPageNumber + 1,
                                          });
                                        },
                                        onChangeRowsPerPage: (event) => {
                                          setMenuRolePagination({
                                            ...menuRolePagination,
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
              )
        }
      </Grid>
      <Dialog
        open={createMenuItemOpen}
        scroll="paper"
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle>{texts['003']}</DialogTitle>
        <DialogContent>
          <Box className={classes.createMenuInfoItemWrapper}>
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
          <Box className={classes.createMenuInfoItemWrapper}>
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
          <Box className={classes.createMenuInfoItemWrapper}>
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
            onClick={() => createNewMenuItem(createMenuData)}
          >{systemTexts['SUBMIT']}</Button>
        </DialogActions>
      </Dialog>
      <RoleSelector
        open={roleSelectorOpen}
        submitting={grantMenuRolesLoading}
        onCancel={() => {
          setRoleSelectorOpen(false);
        }}
        onSelectRoles={(roleIds) => {
          handleGrantMenuRoles(_.get(menuTreeItems[selectedMenuTreeItemIndex], 'id'), roleIds);
        }}
      />
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ProfilePage);

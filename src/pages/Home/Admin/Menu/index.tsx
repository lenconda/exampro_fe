import { batchUpdateMenuItems, createMenu, getFlattenedMenuTree } from './service';
import { Dispatch, MenuItemRequestData, MenuTreeItemMetadata, User } from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import { usePageTexts, useTexts } from '../../../../utils/texts';
import AppIndicator from '../../../../components/AppIndicator';
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
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import SvgIcon from '@material-ui/core/SvgIcon';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import * as icons from 'mdi-material-ui';
import LinkPlusIcon from 'mdi-material-ui/LinkPlus';
import _ from 'lodash';
import clsx from 'clsx';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';

export interface ProfilePageProps extends Dispatch, AppState {}

const defaultCreateMenuRequestData: MenuItemRequestData = {
  title: '',
  pathname: '',
  icon: '',
};
const menuInfoTabs = ['BASIC', 'ROLES'];

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

  useEffect(() => {
    fetchFlattenedMenuTree();
  }, []);

  useEffect(() => {
    if (menuTreeItems && !_.isNumber(selectedMenuTreeItemIndex)) {
      setSelectedMenuTreeItemIndex(0);
    }
  }, [selectedMenuTreeItemIndex, menuTreeItems]);

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
                    <Card classes={{ root: classes.sectionWrapper }}>
                      {
                        (!_.isNumber(selectedMenuTreeItemIndex) && menuTreeItems[selectedMenuTreeItemIndex])
                          ? <Typography style={{ textAlign: 'center' }}>{texts['002']}</Typography>
                          : (
                            <>
                              <Tabs
                                value={selectedTabIndex}
                                indicatorColor="primary"
                                textColor="primary"
                                centered={true}
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
                                  </Box>
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
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ProfilePage);

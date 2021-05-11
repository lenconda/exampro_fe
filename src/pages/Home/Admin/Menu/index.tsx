import { getFlattenedMenuTree } from './service';
import { Dispatch, MenuTreeItemMetadata } from '../../../../interfaces';
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
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import * as icons from 'mdi-material-ui';
import LinkPlusIcon from 'mdi-material-ui/LinkPlus';
import _ from 'lodash';
import clsx from 'clsx';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';

export interface ProfilePageProps extends Dispatch, AppState {}

const useStyles = makeStyles((theme) => {
  return {
    sectionWrapper: {
      padding: theme.spacing(5),
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
  const [selectedMenuTreeItem, setSelectedMenuTreeItem] = useState<MenuTreeItemMetadata>(undefined);

  const fetchFlattenedMenuTree = () => {
    setMenuTreeItemsLoading(true);
    getFlattenedMenuTree().then((menuTree) => {
      setMenuTreeItems(menuTree);
    }).finally(() => setMenuTreeItemsLoading(false));
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
    const currentMenuTree = reorderMenuTreeItems(Array.from(menuTreeItems), source.index, destination.index);
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
    if (menuTreeItems && !selectedMenuTreeItem) {
      setSelectedMenuTreeItem(menuTreeItems[0]);
    }
  }, [selectedMenuTreeItem, menuTreeItems]);

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
                        >{texts['001']}</Button>
                        <Button
                          variant="outlined"
                          size="small"
                        >{systemTexts['SAVE']}</Button>
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
                                                    setSelectedMenuTreeItem(treeItem);
                                                  }}
                                                >
                                                  <MenuItem
                                                    classes={{
                                                      root: clsx(classes.menuTreeItem, {
                                                        [classes.menuTreeItemSelected]: selectedMenuTreeItem.id === treeItem.id,
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
                    </Card>
                  </Grid>
                </>
              )
        }
      </Grid>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ProfilePage);

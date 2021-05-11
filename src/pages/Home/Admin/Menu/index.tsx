import { getFlattenedMenuTree } from './service';
import { Dispatch, MenuTreeItemMetadata } from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import { usePageTexts } from '../../../../utils/texts';
import AppIndicator from '../../../../components/AppIndicator';
import Card from '@material-ui/core/Card';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { makeStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import * as icons from 'mdi-material-ui';
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
      padding: theme.spacing(2),
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
  };
});

const ProfilePage: React.FC<ProfilePageProps> = ({
  dispatch,
}) => {
  const history = useHistory();
  const classes = useStyles();
  const texts = usePageTexts(dispatch, '/home/admin/menu');
  const [menuTree, setMenuTree] = useState<MenuTreeItemMetadata[]>([]);
  const [menuTreeLoading, setMenuTreeLoading] = useState<boolean>(false);

  const fetchFlattenedMenuTree = () => {
    setMenuTreeLoading(true);
    getFlattenedMenuTree().then((menuTree) => {
      setMenuTree(menuTree);
    }).finally(() => setMenuTreeLoading(false));
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
    const currentMenuTree = reorderMenuTreeItems(Array.from(menuTree), source.index, destination.index);
    setMenuTree(currentMenuTree.map((treeNode, index) => {
      return {
        ...treeNode,
        order: index + 1,
      };
    }));
  };

  useEffect(() => {
    fetchFlattenedMenuTree();
  }, []);

  return (
    <div className="app-page app-page-admin__menu">
      <Grid
        container={true}
        spacing={3}
        classes={{ container: clsx('app-grid-container', classes.container) }}
      >
        {
          menuTreeLoading
            ? <AppIndicator type="loading" />
            : menuTree && menuTree.length === 0
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
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="menu-tree">
                          {
                            (provided) => {
                              return (
                                <div ref={provided.innerRef}>
                                  {
                                    menuTree.map((treeItem, index) => {
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
                                                >
                                                  <MenuItem
                                                    classes={{ root: classes.menuTreeItem }}
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

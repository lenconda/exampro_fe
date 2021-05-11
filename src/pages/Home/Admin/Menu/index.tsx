import { getMenuTree } from './service';
import { Dispatch, MenuItemMetadata } from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import { usePageTexts } from '../../../../utils/texts';
import { useRequest } from '../../../../utils/request';
import AppIndicator from '../../../../components/AppIndicator';
import Card from '@material-ui/core/Card';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import { makeStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import * as icons from 'mdi-material-ui';
import _ from 'lodash';
import clsx from 'clsx';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

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
  const [menuTree = [], menuTreeLoading, error, refresh] = useRequest<MenuItemMetadata[]>(getMenuTree, []);

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
                    md={5}
                    lg={4}
                    xl={3}
                  >
                    <Card classes={{ root: clsx(classes.sectionWrapper, classes.menuWrapper) }}>
                      <DragDropContext onDragEnd={() => {}}>
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
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                >
                                                  <MenuItem classes={{ root: classes.menuTreeItem }}>
                                                    {
                                                      Icon && <Icon fontSize="small" />
                                                    }
                                                    <Typography noWrap={true}>{treeItem.pathname}</Typography>
                                                  </MenuItem>
                                                </div>
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
                    md={7}
                    lg={8}
                    xl={9}
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

import {
  queryAllDynamicConfigs,
  updateDynamicConfig,
  deleteDynamicConfigs,
  createDynamicConfig,
} from './service';
import {
  CustomPaginationData,
  Dispatch,
  DynamicConfig,
  PaginationResponse,
} from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import { usePageTexts, useTexts } from '../../../../utils/texts';
import AppIndicator from '../../../../components/AppIndicator';
import AppSearchBarInput from '../../../../components/AppSearchBar/Input';
import { useDebouncedValue } from '../../../../utils/hooks';
import React, { useEffect, useState } from 'react';
import { lighten, makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TablePagination from '@material-ui/core/TablePagination';
import Typography from '@material-ui/core/Typography';
import CogOutlineIcon from 'mdi-material-ui/CogOutline';
import _ from 'lodash';
import clsx from 'clsx';

export interface DynamicPageProps extends Dispatch, AppState {}
export type DynamicConfigPaginationData = CustomPaginationData;

const defaultDynamicConfigsPaginationData: DynamicConfigPaginationData = {
  page: 1,
  size: 10,
};

const useStyles = makeStyles((theme) => {
  return {
    sectionWrapper: {
      maxHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'nowrap',
    },
    itemsWrapper: {
      padding: 0,
      overflow: 'scroll',
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
    searchWrapper: {
      padding: theme.spacing(2),
    },
  };
});

const DynamicPage: React.FC<DynamicPageProps> = ({
  dispatch,
}) => {
  const classes = useStyles();
  const texts = usePageTexts(dispatch, '/home/admin/dynamic');
  const tableTexts = useTexts(dispatch, 'table');
  const systemTexts = useTexts(dispatch, 'system');
  const [dynamicConfigsData, setDynamicConfigsData] = useState<PaginationResponse<DynamicConfig>>({
    items: [],
    total: 0,
  });
  const [dynamicConfigsLoading, setDynamicConfigsLoading] = useState<boolean>(true);
  const [
    dynamicConfigsPagination,
    setDynamicConfigsPagination,
  ] = useState<DynamicConfigPaginationData>(_.clone(defaultDynamicConfigsPaginationData));
  const [selectedDynamicConfig, setSelectedDynamicConfig] = useState<DynamicConfig>(undefined);
  const [searchValue, setSearchValue] = useState<string>('');
  const debouncedSearchValue = useDebouncedValue(searchValue);

  const handleQueryAllDynamicConfigs = (pagination: DynamicConfigPaginationData) => {
    setDynamicConfigsLoading(true);
    queryAllDynamicConfigs(pagination).then((data) => {
      setDynamicConfigsData(data);
    }).finally(() => setDynamicConfigsLoading(false));
  };

  useEffect(() => {
    handleQueryAllDynamicConfigs(dynamicConfigsPagination);
  }, [dynamicConfigsPagination]);

  useEffect(() => {
    setDynamicConfigsPagination({
      ...dynamicConfigsPagination,
      search: debouncedSearchValue,
    });
  }, [debouncedSearchValue]);

  return (
    <div className="app-page app-page-admin__dynamic">
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
            md={selectedDynamicConfig ? 6 : 12}
            lg={selectedDynamicConfig ? 5 : 12}
            xl={selectedDynamicConfig ? 4 : 12}
          >
            {
              dynamicConfigsLoading
                ? <AppIndicator type="loading" />
                : <Card classes={{ root: clsx(classes.sectionWrapper) }}>
                  <Box className={classes.searchWrapper}>
                    <AppSearchBarInput
                      value={searchValue}
                      placeholder={texts['010']}
                      onValueChange={(value) => setSearchValue(value)}
                    />
                  </Box>
                  {
                    dynamicConfigsData && dynamicConfigsData.items.length === 0
                      ? <AppIndicator type="empty" />
                      : (
                        <>
                          <Box className={classes.itemsWrapper}>
                            {
                              dynamicConfigsData.items.map((item) => {
                                return (
                                  <MenuItem key={item.id}>
                                    <Typography>
                                      <CogOutlineIcon />
                                      {item.pathname}
                                    </Typography>
                                  </MenuItem>
                                );
                              })
                            }
                          </Box>
                          <TablePagination
                            component="div"
                            count={dynamicConfigsData.total}
                            page={(dynamicConfigsPagination.page || 1) - 1}
                            rowsPerPageOptions={[5, 10, 20, 50]}
                            rowsPerPage={dynamicConfigsPagination.size || 10}
                            labelRowsPerPage={tableTexts['001']}
                            backIconButtonText={tableTexts['002']}
                            nextIconButtonText={tableTexts['003']}
                            labelDisplayedRows={({ from, to, count }) => `${count} ${tableTexts['004']} ${from}-${to}`}
                            onChangePage={(event, newPageNumber) => {
                              setDynamicConfigsPagination({
                                ...dynamicConfigsPagination,
                                page: newPageNumber + 1,
                              });
                            }}
                            onChangeRowsPerPage={(event) => {
                              setDynamicConfigsPagination({
                                ...dynamicConfigsPagination,
                                size: parseInt(event.target.value, 10),
                                page: 1,
                              });
                            }}
                          />
                        </>
                      )
                  }
                </Card>
            }
          </Grid>
          {
            selectedDynamicConfig && (
              <Grid
                item={true}
                xs={12}
                sm={12}
                md={6}
                lg={7}
                xl={8}
              >
                <Card>
                  <CardContent>
                  </CardContent>
                </Card>
              </Grid>
            )
          }
        </>
      </Grid>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(DynamicPage);

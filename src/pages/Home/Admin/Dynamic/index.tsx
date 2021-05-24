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
import AppDialogManager from '../../../../components/AppDialog/Manager';
import React, { useEffect, useState } from 'react';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TablePagination from '@material-ui/core/TablePagination';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import CogOutlineIcon from 'mdi-material-ui/CogOutline';
import _ from 'lodash';
import clsx from 'clsx';
import MonacoEditor from '@monaco-editor/react';

export interface DynamicPageProps extends Dispatch, AppState {}
export type DynamicConfigPaginationData = CustomPaginationData;

const defaultDynamicConfigsPaginationData: DynamicConfigPaginationData = {
  page: 1,
  size: 10,
};
const defaultCreateDynamicConfigData: Omit<DynamicConfig, 'id'> = {
  content: '',
  pathname: '',
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
      '& > *': {
        flexShrink: 0,
        flexGrow: 0,
      },
    },
    item: {
      flexShrink: 0,
      flexGrow: 0,
    },
    selectedItem: {
      backgroundColor: lighten(theme.palette.primary.main, 0.85),
      '&:hover': {
        backgroundColor: lighten(theme.palette.primary.main, 0.85),
      },
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
      padding: theme.spacing(2),
      paddingTop: 0,
    },
    infoItemWrapper: {
      marginBottom: theme.spacing(3),
      display: 'flex',
      alignItems: 'stretch',
      '& > button': {
        marginRight: theme.spacing(1),
      },
    },
    deleteButton: {
      color: theme.palette.error.main,
    },
    searchWrapper: {
      padding: theme.spacing(2),
    },
    createDynamicConfigDialogContent: {
      display: 'flex',
    },
    infoCard: {
      height: '100%',
    },
    infoCardContent: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      paddingTop: theme.spacing(4),
    },
    editorWrapper: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      flexShrink: 0,
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
  const [createDynamicConfigOpen, setCreateDynamicConfigOpen] = useState<boolean>(false);
  const [createDynamicConfigLoading, setCreateDynamicConfigLoading] = useState<boolean>(false);
  const [createDynamicConfigData, setCreateDynamicConfigData] = useState(_.clone(defaultCreateDynamicConfigData));
  const [updateDynamicConfigLoading, setUpdateDynamicConfigLoading] = useState<boolean>(false);
  const [deleteDynamicConfigLoading, setDeleteDynamicConfigLoading] = useState<boolean>(false);

  const validateDynamicConfigData = (config: Partial<DynamicConfig>) => {
    if (!config.pathname || !config.content) {
      return false;
    }
    try {
      JSON.parse(config.content);
      return true;
    } catch {
      return false;
    }
  };

  const handleQueryAllDynamicConfigs = (pagination: DynamicConfigPaginationData) => {
    setDynamicConfigsLoading(true);
    queryAllDynamicConfigs(pagination).then((data) => {
      setDynamicConfigsData(data);
    }).finally(() => setDynamicConfigsLoading(false));
  };

  const handleCreateDynamicConfigItem = (config: Partial<DynamicConfig>) => {
    setCreateDynamicConfigLoading(true);
    createDynamicConfig(config).finally(() => {
      setCreateDynamicConfigData(_.clone(defaultCreateDynamicConfigData));
      setCreateDynamicConfigLoading(false);
      setCreateDynamicConfigOpen(false);
      handleQueryAllDynamicConfigs(dynamicConfigsPagination);
    });
  };

  const handleUpdateDynamicConfigItem = (config: Partial<DynamicConfig>) => {
    setUpdateDynamicConfigLoading(true);
    updateDynamicConfig(config.id, config).finally(() => {
      setUpdateDynamicConfigLoading(false);
      handleQueryAllDynamicConfigs(dynamicConfigsPagination);
    });
  };

  const handleDeleteDynamicConfigItem = (config: Partial<DynamicConfig>) => {
    setDeleteDynamicConfigLoading(true);
    deleteDynamicConfigs([config.id]).finally(() => {
      setDeleteDynamicConfigLoading(false);
      setSelectedDynamicConfig(null);
      handleQueryAllDynamicConfigs(dynamicConfigsPagination);
    });
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
                      placeholder={texts['001']}
                      onValueChange={(value) => setSearchValue(value)}
                    />
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <Button
                      color="primary"
                      size="small"
                      variant="contained"
                      onClick={() => setCreateDynamicConfigOpen(true)}
                    >{texts['002']}</Button>
                  </Box>
                  {
                    dynamicConfigsData && dynamicConfigsData.items.length === 0
                      ? <AppIndicator type="empty" />
                      : (
                        <>
                          <Box className={classes.itemsWrapper}>
                            {
                              dynamicConfigsData.items.map((item, index) => {
                                return (
                                  <MenuItem
                                    key={index}
                                    classes={{
                                      root: clsx(classes.item, {
                                        [classes.selectedItem]: selectedDynamicConfig && selectedDynamicConfig.id === item.id,
                                      }),
                                    }}
                                    onClick={() => setSelectedDynamicConfig(item)}
                                  >
                                    <Typography classes={{ root: 'app-icon-typography' }}>
                                      <CogOutlineIcon fontSize="small" />
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
                            style={{ flexShrink: 0 }}
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
                <Card classes={{ root: classes.infoCard }}>
                  <CardContent classes={{ root: classes.infoCardContent }}>
                    <Box className={clsx(classes.infoItemWrapper)}>
                      <TextField
                        value={selectedDynamicConfig.pathname}
                        variant="outlined"
                        fullWidth={true}
                        label={texts['004']}
                        onChange={(event) => {
                          setSelectedDynamicConfig({
                            ...selectedDynamicConfig,
                            pathname: event.target.value,
                          });
                        }}
                      />
                    </Box>
                    <Box className={classes.editorWrapper}>
                      <Typography gutterBottom={true}>{texts['003']}</Typography>
                      <MonacoEditor
                        className="app-monaco-editor"
                        wrapperClassName="app-monaco-editor-wrapper"
                        value={selectedDynamicConfig.content}
                        language="json"
                        onChange={(content: string) => {
                          setSelectedDynamicConfig({
                            ...selectedDynamicConfig,
                            content,
                          });
                        }}
                      />
                    </Box>
                    <Box
                      className={clsx(classes.buttonsWrapper, 'app-margin-top')}
                      style={{ flexShrink: 0 }}
                    >
                      <Button
                        variant="outlined"
                        color="primary"
                        disabled={
                          !validateDynamicConfigData(selectedDynamicConfig)
                          || updateDynamicConfigLoading
                          || deleteDynamicConfigLoading
                        }
                        onClick={() => handleUpdateDynamicConfigItem(selectedDynamicConfig)}
                      >{updateDynamicConfigLoading ? systemTexts['SAVING'] : systemTexts['SAVE']}</Button>
                      <Button
                        variant="outlined"
                        classes={{ root: classes.deleteButton }}
                        disabled={
                          updateDynamicConfigLoading
                          || deleteDynamicConfigLoading
                        }
                        onClick={() => {
                          AppDialogManager.confirm(texts['006'], {
                            onConfirm: () => handleDeleteDynamicConfigItem(selectedDynamicConfig),
                          });
                        }}
                      >{deleteDynamicConfigLoading ? systemTexts['DELETING'] : systemTexts['DELETE']}</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          }
        </>
      </Grid>
      <Dialog
        open={createDynamicConfigOpen}
        maxWidth="md"
        fullWidth={true}
        scroll="paper"
      >
        <DialogTitle>{texts['002']}</DialogTitle>
        <DialogContent>
          <Box className={classes.infoItemWrapper}>
            <TextField
              fullWidth={true}
              variant="outlined"
              label={texts['004']}
              value={createDynamicConfigData.pathname}
              onChange={(event) => {
                setCreateDynamicConfigData({
                  ...createDynamicConfigData,
                  pathname: event.target.value,
                });
              }}
            />
          </Box>
          <Box>
            <Typography classes={{ root: 'app-margin-bottom' }}>{texts['003']}</Typography>
            <MonacoEditor
              language="json"
              className={clsx('app-monaco-editor')}
              value={createDynamicConfigData.content}
              onChange={(content: string) => {
                setCreateDynamicConfigData({
                  ...createDynamicConfigData,
                  content,
                });
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => setCreateDynamicConfigOpen(false)}
          >{systemTexts['CANCEL']}</Button>
          <Button
            color="primary"
            disabled={!validateDynamicConfigData(createDynamicConfigData) || createDynamicConfigLoading}
            onClick={() => handleCreateDynamicConfigItem(createDynamicConfigData)}
          >{createDynamicConfigLoading ? systemTexts['SUBMITTING'] : systemTexts['OK']}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(DynamicPage);

import AppTableToolbar, { ToolbarButton } from './Toolbar';
import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import { connect } from '../../patches/dva';
import { Dispatch } from '../../interfaces';
import { useTexts } from '../../utils/texts';
import { useUpdateEffect } from '../../utils/hooks';
import { useWindowInnerSizes } from '../../utils/window';
import AppIndicator from '../AppIndicator';
import React, { useEffect, useState, useRef } from 'react';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table, { TableProps } from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell, { TableCellProps } from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import TablePagination, { TablePaginationProps } from '@material-ui/core/TablePagination';
import clsx from 'clsx';
import _ from 'lodash';
import { Box } from '@material-ui/core';

export interface TableSchema {
  title: string | React.ReactNode;
  key: string;
  TableCellProps?: TableCellProps;
  minWidth?: number;
  render?: (row: any, value: any) => React.ReactNode;
}

export interface AppTableProps extends TableProps {
  schema?: TableSchema[];
  data?: Record<string, any>[];
  selectable?: boolean;
  loading?: boolean;
  containerMinHeight?: number;
  toolbarButtons?: ToolbarButton[];
  wrapperClassName?: string;
  collapseHeight?: number;
  TablePaginationProps?: TablePaginationProps;
  PaperProps?: PaperProps;
  onSelectionChange?: (items: any[]) => void;
}

export interface AppTableComponentProps extends AppTableProps, AppState, Dispatch {}

const useStyles = makeStyles((theme) => {
  return {
    tableContainer: {
      width: '100%',
      userSelect: 'none',
    },
    table: {
      width: '100%',
      overflowX: 'scroll',
    },
    wrapper: {
      boxSizing: 'border-box',
      height: '100%',
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    tableBody: {
      maxHeight: '100%',
      overflowY: 'scroll',
    },
    tableRowSelected: {
      color: theme.palette.primary.main,
      backgroundColor: lighten(theme.palette.primary.light, 0.85),
    },
  };
});

const renderTableCell = (
  dataItem: Record<string, any>,
  schemaItem: TableSchema,
): React.ReactNode => {
  const { key, render } = schemaItem;
  const columnValue = _.get(dataItem, key);
  let columnNode;
  if (render && _.isFunction(render)) {
    columnNode = render(dataItem, columnValue);
  } else {
    columnNode = columnValue as React.ReactNode;
  }
  return columnNode;
};


const AppTable: React.FC<AppTableComponentProps> = ({
  schema = [],
  data = [],
  loading = false,
  selectable = true,
  collapseHeight = 83,
  containerMinHeight = 150,
  toolbarButtons = [],
  wrapperClassName = '',
  dispatch,
  onSelectionChange,
  TablePaginationProps = {
    count: 0,
    page: 0,
    rowsPerPage: 10,
    onChangePage: () => {},
  },
  PaperProps = {},
  ...props
}) => {
  const classes = useStyles();
  const texts = useTexts(dispatch, 'table');
  const [selectedItemIndexes, setSelectedItemIndexes] = useState<number[]>([]);
  const tableContainer = useRef<HTMLDivElement>(undefined);
  const tablePaper = useRef<HTMLDivElement>(undefined);
  const tableWrapper = useRef<HTMLDivElement>(undefined);
  const tableBody = useRef<HTMLElement>(undefined);
  const tableHead = useRef<HTMLElement>(undefined);
  const tablePagination = useRef<HTMLElement>(undefined);
  const tableToolBar = useRef<HTMLElement>(undefined);
  const [tableContainerMaxHeight, setTableContainerMaxHeight] = useState<number>(0);
  const [innerWidth, innerHeight] = useWindowInnerSizes();

  const handleRowCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const checked = event.target.checked;
    if (checked) {
      if (!selectedItemIndexes.includes(index)) {
        setSelectedItemIndexes(selectedItemIndexes.concat(index));
      }
    } else {
      setSelectedItemIndexes(selectedItemIndexes.filter((selectedIndex) => {
        return selectedIndex !== index;
      }));
    }
  };

  const handleRowClick = (index: number) => {
    if (!selectable) { return }
    if (!selectedItemIndexes.includes(index)) {
      setSelectedItemIndexes(selectedItemIndexes.concat(index));
    } else {
      setSelectedItemIndexes(selectedItemIndexes.filter((selectedIndex) => selectedIndex !== index));
    }
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    pageNumber: number,
  ) => {
    const customChangePage = _.get(TablePaginationProps, 'onChangePage');
    setSelectedItemIndexes([]);
    if (_.isFunction(customChangePage)) {
      customChangePage(event, pageNumber);
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const customChangeRowsPerPage = _.get(TablePaginationProps, 'onChangeRowsPerPage');
    if (_.isFunction(customChangeRowsPerPage)) {
      customChangeRowsPerPage(event);
    }
  };

  const handleHeadCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if (checked) {
      setSelectedItemIndexes(data.map((item, index) => index));
    } else {
      setSelectedItemIndexes([]);
    }
  };

  useUpdateEffect(() => {
    if (_.isFunction(onSelectionChange)) {
      onSelectionChange(selectedItemIndexes.map((index) => data[index]));
    }
  }, [selectedItemIndexes]);

  useEffect(() => {
    if (loading) {
      setSelectedItemIndexes([]);
    }
  }, [loading]);

  useEffect(() => {
    if (
      !loading
      && tableContainer.current
      && tablePaper.current
      && tableWrapper.current
      && tableBody.current
      && tableHead
      && tablePagination
    ) {
      const newTableContainerMaxHeight =
        window.innerHeight
        - tableBody.current.offsetTop
        - tablePagination.current.clientHeight
        - tableHead.current.clientHeight
        - (tableToolBar.current ? tableToolBar.current.clientHeight : 0)
        - collapseHeight;
      if (newTableContainerMaxHeight > containerMinHeight) {
        setTableContainerMaxHeight(newTableContainerMaxHeight);
      } else {
        setTableContainerMaxHeight(containerMinHeight);
      }
    }
  }, [
    tableBody.current,
    tableContainer.current,
    tablePaper.current,
    loading,
    selectedItemIndexes.length,
    innerWidth,
    innerHeight,
    tableWrapper.current,
    tableHead.current,
    tablePagination.current,
    tableToolBar.current,
  ]);

  return (
    <div className={wrapperClassName}>
      {
        loading
          ? (
            <AppIndicator type="loading" />
          )
          : data.length === 0
            ? (
              <AppIndicator type="empty" />
            )
            : (
              <div className={clsx(classes.wrapper)} ref={tableWrapper}>
                <Paper ref={tablePaper} {...PaperProps}>
                  {
                    selectedItemIndexes.length > 0 && (
                      <AppTableToolbar
                        innerRef={tableToolBar}
                        buttons={toolbarButtons}
                        selected={selectedItemIndexes.map((index) => data[index])}
                      />
                    )
                  }
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    ref={tableContainer}
                    classes={{ root: clsx(classes.tableContainer) }}
                    style={{
                      maxHeight: tableContainerMaxHeight,
                    }}
                  >
                    <Table
                      {...props}
                      stickyHeader={true}
                      classes={{
                        root: clsx(classes.table, _.get(props, 'classes.root')),
                      }}
                    >
                      {
                        schema.length > 0 && (
                          <TableHead innerRef={tableHead}>
                            <TableRow>
                              {
                                selectable && (
                                  <TableCell>
                                    <Checkbox
                                      color="primary"
                                      indeterminate={
                                        selectedItemIndexes.length !== 0
                                        && data.length !== 0
                                        && selectedItemIndexes.length < data.length
                                      }
                                      checked={
                                        selectedItemIndexes.length !== 0
                                        && data.length !== 0
                                        && selectedItemIndexes.length === data.length
                                      }
                                      onChange={handleHeadCheckboxChange}
                                    />
                                  </TableCell>
                                )
                              }
                              {
                                schema.map((schemaItem, index) => (
                                  <TableCell
                                    key={index}
                                    {...(schemaItem.TableCellProps || {})}
                                    style={{
                                      minWidth: schemaItem.minWidth || 140,
                                    }}
                                  >{schemaItem.title}</TableCell>
                                ))
                              }
                            </TableRow>
                          </TableHead>
                        )
                      }
                      <TableBody classes={{ root: classes.tableBody }} innerRef={tableBody}>
                        {
                          data.map((dataItem, index) => (
                            <TableRow
                              key={index}
                              classes={{
                                root: clsx({
                                  [classes.tableRowSelected]: selectedItemIndexes.includes(index),
                                }),
                              }}
                              onClick={() => handleRowClick(index)}
                            >
                              {
                                selectable && (
                                  <TableCell>
                                    <Checkbox
                                      color="primary"
                                      checked={selectedItemIndexes.includes(index)}
                                      onChange={(event) => handleRowCheckboxChange(event, index)}
                                      onClick={(event) => event.stopPropagation()}
                                    />
                                  </TableCell>
                                )
                              }
                              {
                                schema.map((schemaItem, index) => (
                                  <TableCell key={index}>{renderTableCell(dataItem, schemaItem)}</TableCell>
                                ))
                              }
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    {...TablePaginationProps}
                    component={Box}
                    ref={tablePagination}
                    rowsPerPageOptions={[5, 10, 20, 50]}
                    labelRowsPerPage={texts['001']}
                    backIconButtonText={texts['002']}
                    nextIconButtonText={texts['003']}
                    labelDisplayedRows={({ from, to, count }) => `${count} ${texts['004']} ${from}-${to}`}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                  />
                </Paper>
              </div>
            )
      }
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(AppTable) as React.FC<AppTableProps>;

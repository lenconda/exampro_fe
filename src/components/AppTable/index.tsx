import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table, { TableProps } from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell, { TableCellProps } from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import clsx from 'clsx';
import _ from 'lodash';
import { TablePagination, TablePaginationProps, Typography } from '@material-ui/core';
import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import { connect } from '../../patches/dva';
import { Dispatch } from '../../interfaces';
import { useTexts } from '../../utils/texts';
import { FileQuestion } from 'mdi-material-ui';

export interface TableSchema {
  title: string | React.ReactNode;
  key: string;
  TableCellProps?: TableCellProps;
  minWidth?: number;
  render?: (row: any, value: any) => React.ReactNode;
}

export interface AppTableProps extends TableProps, AppState, Dispatch {
  schema?: TableSchema[];
  data?: Record<string, any>[];
  TablePaginationProps?: TablePaginationProps;
  loading?: boolean;
}

const useStyles = makeStyles((theme) => {
  return {
    tableContainer: {
      maxHeight: 440,
      width: '100%',
    },
    table: {
      width: '100%',
      overflowX: 'scroll',
    },
    empty: {
      position: 'relative',
      height: 300,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tableEmpty: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    tableEmptyWrapper: {
      borderBottom: 'none',
      color: theme.palette.grey.A400,
    },
    tableEmptyIcon: {
      width: 64,
      height: 64,
      color: theme.palette.grey.A200,
    },
    tableBody: {
      maxHeight: '100%',
      overflowY: 'scroll',
    },
  };
});

const renderTableCell = (
  dataItem: Record<string, any>,
  schemaItem: TableSchema,
): React.ReactNode => {
  const { key, render } = schemaItem;
  const columnValue = dataItem[key];
  let columnNode;
  if (render && _.isFunction(render)) {
    columnNode = render(dataItem, columnValue);
  } else {
    columnNode = columnValue as React.ReactNode;
  }
  return columnNode;
};

const AppTable: React.FC<AppTableProps> = React.forwardRef(({
  schema = [],
  data = [],
  dispatch,
  loading = false,
  TablePaginationProps = {
    count: 0,
    page: 0,
    rowsPerPage: 10,
    onChangePage: () => {},
  },
  ...props
}, ref) => {
  const classes = useStyles();
  const texts = useTexts(dispatch, 'table');

  const component = loading
    ? (
      <div className="app-loading">
        <CircularProgress classes={{ root: 'app-loading__icon' }} />
      </div>
    )
    : (
      data.length === 0
        ? (
          <div className={clsx(classes.empty)}>
            <FileQuestion classes={{ root: clsx(classes.tableEmptyIcon) }} />
            <Typography>{texts['005']}</Typography>
          </div>
        )
        : (
          <Paper>
            <TableContainer component={Paper} elevation={0} classes={{ root: clsx(classes.tableContainer) }}>
              <Table
                {...props}
                stickyHeader={true}
                classes={{
                  root: clsx(classes.table, _.get(props, 'classes.root')),
                }}
              >
                {
                  schema.length > 0 && (
                    <TableHead>
                      <TableRow>
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
                <TableBody classes={{ root: classes.tableBody }}>
                  {
                    data.map((dataItem, index) => (
                      <TableRow key={index}>
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
              component="div"
              rowsPerPageOptions={[10, 15, 20, 50]}
              labelRowsPerPage={texts['001']}
              backIconButtonText={texts['002']}
              nextIconButtonText={texts['003']}
              labelDisplayedRows={({ from, to, count }) => `${count}${texts['004']}${from}-${to}`}
            />
          </Paper>
        )
    );

  return component;
});

export default connect(({ app }: ConnectState) => app)(AppTable);

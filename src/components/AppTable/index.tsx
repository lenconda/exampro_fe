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
import { TablePagination, TablePaginationProps } from '@material-ui/core';
import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import { connect } from '../../patches/dva';
import { Dispatch } from '../../interfaces';
import { useTexts } from '../../utils/texts';

export interface TableSchema {
  title: string | React.ReactNode;
  key: string;
  TableCellProps?: TableCellProps;
  render?: (row: any, value: any) => React.ReactNode;
}

export interface AppTableProps extends TableProps, AppState, Dispatch {
  schema?: TableSchema[];
  data?: Record<string, any>[];
  TablePaginationProps?: TablePaginationProps;
  loading?: boolean;
}

const useStyles = makeStyles({
  tableContainer: {
    width: '100%',
  },
  table: {
    width: '100%',
  },
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

const AppTable: React.FC<AppTableProps> = ({
  schema = [],
  data = [],
  dispatch,
  loading = false,
  ...props
}) => {
  const classes = useStyles();
  const texts = useTexts(dispatch, 'tablePagination');

  const component = loading
    ? (
      <div className="app-loading">
        <CircularProgress classes={{ root: 'app-loading__icon' }} />
      </div>
    )
    : (
      <TableContainer component={Paper} classes={{ root: clsx(classes.tableContainer) }}>
        {
          (data.length > 0 && schema.length > 0) && (
            <Table {...props} classes={{ root: clsx(classes.table, _.get(props, 'classes.root')) }}>
              <TableHead>
                <TableRow>
                  {
                    schema.map((schemaItem, index) => (
                      <TableCell
                        key={index}
                        {...(schemaItem.TableCellProps || {})}
                      >{schemaItem.title}</TableCell>
                    ))
                  }
                </TableRow>
              </TableHead>
              <TableBody>
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
              <TablePagination
                {...(props.TablePaginationProps)}
                rowsPerPageOptions={[10, 15, 20, 50]}
                labelRowsPerPage={texts['001']}
                backIconButtonText={texts['002']}
                nextIconButtonText={texts['003']}
                labelDisplayedRows={({ from, to, count }) => `${count}${texts['004']}${from}-${to}`}
              />
            </Table>
          )
        }
      </TableContainer>
    );

  return component;
};

export default connect(({ app }: ConnectState) => app)(AppTable);

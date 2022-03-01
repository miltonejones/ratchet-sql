import React from 'react';

import {
  ConnectionForm,
  ColumnForm,
  ConnectionList,
  PaginationBar,
  QueryPane,
  TableList,
  ColumnList,
  DataGrid,
} from './components';

import {
  Collapse,
  Flex,
  IconButton,
  Box,
  Frame,
  Typography,
  css,
  Avatar,
  Dialog,
  Backdrop,
  Snackbar,
  Spacer,
  Spinner,
  Menu,
} from './components/UI/UI';
import DocNode from './components/UI/Docs/DocNode';
import useApp from './hooks/useApp';
import { Smiley, Close, Hamburger, Dribble } from './icons';

import './style.css';

export default function App() {
  const {
    collapseHeight,
    columnListArgs,
    connectionListArgs,
    connectionFormArgs,
    getPage,
    paginationParams,
    queryPaneArgs,
    setState,
    state,
    table,
    tableDesc,
    tableListArgs,
    tableName,
    tableNames,
    viewPaneCss,
    snackState,
    say,
  } = useApp();
  const [open, setOpen] = React.useState(false);
  const CloseIcon = !state.sidebarOpen ? Hamburger : Close;
  return (
    <div style={viewPaneCss} className="App">
      <Flex>
        <div className="sidebar">
          <Flex align="center">
            {!!state.sidebarOpen && (
              <>
                <Avatar
                  src="https://www.mysql.com/common/logos/powered-by-mysql-167x86.png"
                  alt="logo"
                  size="large"
                  mr={2}
                  variant="rounded"
                >
                  a
                </Avatar>
                <Box mb={4}>
                  <Typography variant="body1">
                    <b>Ratchet</b>
                    <i>SQL</i>
                  </Typography>
                  <Typography variant="caption">
                    The Internet's base for data.
                  </Typography>
                </Box>
              </>
            )}
            <Spacer />
            <IconButton
              mr={4}
              size="medium"
              onClick={() =>
                setState({ ...state, sidebarOpen: !state.sidebarOpen })
              }
            >
              <CloseIcon />
            </IconButton>
          </Flex>
          {!!state.sidebarOpen && (
            <Frame offset={48}>
              {/* empty state --- connection form/list */}
              <Collapse on={!tableNames}>
                <ConnectionList {...connectionListArgs} />
              </Collapse>
              {/* list of tables in the current connection */}
              <Collapse
                inspect
                noscroll
                on={!!tableNames}
                height={!!tableName ? '140px' : -1}
              >
                {/* table list card */}
                <TableList {...tableListArgs} />
              </Collapse>{' '}
              {/* list of columns in the selected table */}
              {!!tableDesc && <ColumnList {...columnListArgs} />}
              <Collapse mb={5} on={!!state.selectedColumn}>
                <ColumnForm column={state.selectedColumn} />
              </Collapse>
            </Frame>
          )}
        </div>

        <Flex column className="worksize">
          {!!state.newQuery && <QueryPane {...queryPaneArgs} />}

          {!!table && !!tableDesc && (
            <Box>
              <Flex align="center" style={{ width: '100%' }}>
                <PaginationBar
                  {...paginationParams}
                  click={getPage}
                  label="row"
                />
                <Spacer />
                {!!table.fields && (
                  <Menu
                    button="Sort..."
                    options={table.fields.map((f) => f.name)}
                  />
                )}
              </Flex>

              <div
                className={css({
                  workpane: 1,
                  worksize: 1,
                  lower: state.newQuery,
                })}
              >
                {!!table && <DataGrid table={table} />}
              </div>
            </Box>
          )}
        </Flex>
      </Flex>

      <Flex mt={2}>
        <Spacer />
        <Flex
          align="center"
          onClick={() => setState({ ...state, ratchet: !state.ratchet })}
        >
          {' '}
          <Box mr={2}>
            Powered by <u className="link">RatchetUI</u>{' '}
          </Box>
          <Smiley />
        </Flex>
      </Flex>

      <Backdrop open={state.busy} style={{ color: '#fff' }}>
        <Spinner>
          {' '}
          <Dribble />{' '}
        </Spinner>
        Loading...
      </Backdrop>
      <Dialog
        height="440px"
        width="340px"
        onClose={() => setState((s) => ({ ...s, connectForm: !1 }))}
        open={state.connectForm}
      >
        <ConnectionForm {...connectionFormArgs} />
      </Dialog>
      <Snackbar {...snackState} where="se" />
    </div>
  );
}

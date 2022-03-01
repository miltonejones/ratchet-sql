import React from 'react';
import {
  connectToDb,
  openTable,
  describeTable,
  execQuery,
} from './useDbConnector';

import { useSnackbar } from '../components/UI';

const getConfigs = () =>
  JSON.parse(localStorage.getItem('mysql-configs') ?? '{}');

const setConfigs = (json) =>
  localStorage.setItem('mysql-configs', JSON.stringify(json));

export const collate = (length, pageSize, page) => {
  const startPage = (page - 1) * pageSize;
  return {
    startPage,
    page,
    pageSize,
    length,
  };
};

export default function useApp() {
  const [state, setState] = React.useState({
    ratchet: !1,
    page: 1,
    configs: getConfigs(),
    sidebarOpen: !0,
  });
  const [settings, setSettings] = React.useState({ connect: !0 });

  const changeState = (key, value) => setState((s) => ({ ...s, [key]: value }));
  const { tableName, table, tableDesc, tableNames, page } = state;
  const setTableName = (value) => changeState('tableName', value);
  const setTable = (value) => changeState('table', value);
  const setTableDesc = (value) => changeState('tableDesc', value);
  const setTableNames = (value) => changeState('tableNames', value);
  const setPage = (value) => changeState('page', value);
  const { snackState, say } = useSnackbar();
  const save = (input) => {
    const { title, connect, ...config } = input;
    if (!title) return alert('You must enter a Connection Name');
    const configs = getConfigs();
    Object.assign(configs, { [title]: { ...config, connect } });
    setConfigs(configs);
    console.log({ configs });
    !!connect && openDb(config);
  };

  React.useEffect(() => {
    document.title = 'Ratchet-UI Demo Project';
    const conf = localStorage.getItem('config');
    const confs = getConfigs();
    console.log({ conf, confs });
    if (!conf) return console.log('no conf');
    setSettings(JSON.parse(conf));
    if (!confs) return console.log('no confs');
    setState({ ...state, configs: confs });
  }, []);

  const openDb = async (s) => {
    changeState('busy', !0);
    const res = await connectToDb(s);
    const tables = res.rows.map((f) => f[Object.keys(f)[0]]);
    setTableNames(tables);
    changeState('busy', !1);
    say('Loaded ' + s.database);
  };

  const clearTable = () => {
    if (!!tableName) {
      setTableName(null);
      setTable(null);
      setState({
        configs: getConfigs(),
        sidebarOpen: state.sidebarOpen,
        tableNames: state.tableNames,
      });
      return;
    }
  };

  const getColumn = (columnName) => {
    const is = !!state.columnName;
    setState({
      ...state,
      selectedColumn: is
        ? null
        : tableDesc?.rows?.find((f) => f.COLUMN_NAME === columnName),
      columnName: is ? null : columnName,
    });
  };

  const getTable = async (s, p) => {
    changeState('busy', !0);
    const res = await openTable(settings, s, p);
    setTableName(s);
    setTable(res);
    setPage(p);
    const des = await describeTable(settings, s, p);
    console.log(des);
    setTableDesc(des);
    changeState('busy', !1);
  };

  const execSQL = async (queryText, p = 1) => {
    changeState('busy', !0);
    const res = await execQuery(settings, queryText, p);
    console.log(res);
    setState({ ...state, queryText });
    setTableName('New Query');
    setTable(res);
    setTableDesc({
      rows: res.fields.map((f) => ({ COLUMN_NAME: f.name, DATA_TYPE: f.type })),
    });
    setPage(p);
    changeState('busy', !1);
  };

  const openConnection = (key) => {
    const connectionConfig = state.configs[key];
    const { title, connect, ...config } = connectionConfig;
    setSettings(config);
    setState((s) => ({ ...s, connectionName: key }));
    openDb(config);
  };

  const getPage = (o) => {
    if (state.newQuery) {
      return execSQL(state.queryText, page + o);
    }
    getTable(tableName, page + o);
  };
  const paginationParams = collate(table?.count, 100, page);
  const maxWidth = '200px';

  const columnListArgs = {
    tableName,
    state,
    getColumn,
    columns: tableDesc?.rows,
  };

  const tableListArgs = {
    state,
    setState,
    tableName,
    tableNames,
    getTable,
    clearTable,
    setTableNames,
  };

  const connectionListArgs = {
    state,
    setState,
    openConnection,
  };

  const connectionFormArgs = {
    onSave: save,
    setState: setSettings,
    state: settings,
  };

  const queryPaneArgs = {
    tableNames,
    execSQL,
    config: settings,
    query: state.queryText,
    setQuery: (w) => setState((s) => ({ ...s, queryText: w })),
  };

  const sidebarWidth = state.sidebarOpen ? '25%' : '64px';
  const viewPaneCss = {
    '--sidebar-width': sidebarWidth,
    '--sidebar-min-width': state.sidebarOpen ? '356px' : '0',
  };
  const collapseHeight = 'calc(100vh - var(--margin-offset))';
  return {
    collapseHeight,
    columnListArgs,
    connectionFormArgs,
    connectionListArgs,
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
  };
}

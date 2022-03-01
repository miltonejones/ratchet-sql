import { Play } from '../../icons';
import {
  TextBox,
  IconButton,
  Chip,
  Flex,
  Card,
  Select,
  Dialog,
  usePrompt,
} from '../UI/';
import { describeTable } from '../../hooks/useDbConnector';
import './QueryPane.css';
import React from 'react';

const LazyMiltonContext = React.createContext({});

const EMPTY_CONFIGURATION = {
  tables: [],
  wheres: [],
  orders: [],
};

export default function QueryPane({
  config,
  tableNames,
  query,
  setQuery,
  execSQL,
}) {
  const dialog = usePrompt();
  const [configuration, setConfiguration] = React.useState(EMPTY_CONFIGURATION);
  const createTSQL = React.useCallback(() => {
    const { tables } = configuration;
    const sql = ['SELECT'];
    const cols = [];
    const from = [];
    tables.map((table, i) => {
      const { destTable, srcCol, destCol } = table.join ?? {};
      table.columns
        .filter((f) => !!f.selected)
        .map((col) => cols.push(`${table.alias}.${col.name} as ${col.alias}`));
      from.push(
        i === 0
          ? `${table.name} as ${table.alias}`
          : `JOIN ${table.name} as ${table.alias} ON ${table.alias}.${srcCol} = ${destTable}.${destCol}`
      );
    });
    const o = [...sql, cols.join(', '), 'from', ...from].join(' ');
    return o;
  }, [configuration]);

  const addTable = async (name) => {
    const { rows } = await describeTable(config, name);
    const columns = rows.map((col) => ({
      name: col.COLUMN_NAME,
      alias: col.COLUMN_NAME,
    }));
    const table = { name, alias: name, columns };
    setConfiguration((f) => ({
      ...f,
      tables:
        f.tables.map((v) => v.name).indexOf(name) > -1
          ? f.tables.filter((t) => t.name !== name)
          : f.tables.concat(table),
    }));
  };

  const findTable = (name) => configuration.tables.find((n) => n.name === name);

  const updateTable = (table) =>
    setConfiguration((f) => ({
      ...f,
      tables: f.tables.map((t) => (t.name === table.name ? table : t)),
    }));

  const editTable = async (name, edit) => {
    const table = findTable(name);
    await edit(table);
    updateTable(table);
  };

  const editColumn = async (name, field, edit) => {
    editTable(name, async (table) => {
      const column = table.columns.find((c) => c.name === field);
      await edit(column, table);
      table.columns = table.columns.map((c) =>
        c.name === column.name ? column : c
      );
    });
  };

  const setTableAlias = (name) => {
    editTable(name, async (table) => {
      const alias = await dialog.Prompt(
        `Enter an alias for ${name}`,
        table.alias
      );
      if (!alias) return;
      Object.assign(table, { alias });
    });
  };

  const setColumnAlias = (name, field) => {
    editColumn(name, field, async (col) => {
      const alias = await dialog.Prompt(
        `Enter an alias for ${col.name}`,
        col.alias
      );
      if (!alias) return;
      Object.assign(col, { alias });
    });
  };

  const setColumnSelected = (name, field) => {
    editColumn(name, field, (col) => {
      Object.assign(col, { selected: !col.selected });
    });
  };

  const setTableJoin = (name, field, value) => {
    editTable(name, (table) => {
      const join = table.join ?? {};
      Object.assign(join, { [field]: value });
      Object.assign(table, { join });
    });
  };

  const setBuilderSQL = React.useCallback(() => {
    const sql = createTSQL(configuration);
    setQuery(sql);
  }, [configuration]);

  const queryTextBoxArgs = {
    configuration,
    value: query,
    onChange: (w) => setQuery(w.target.value),
  };

  React.useEffect(() => {
    console.log('Updating SQL');
    setBuilderSQL();
  }, [setBuilderSQL]);

  return (
    <>
      <Flex>
        {' '}
        <LazyMiltonContext.Provider
          value={{
            setTableAlias,
            setTableJoin,
            setColumnAlias,
            setColumnSelected,
            ...configuration,
          }}
        >
          <QueryTextBox {...queryTextBoxArgs} />
        </LazyMiltonContext.Provider>
        <IconButton
          mt={2}
          onClick={() => {
            const sql = createTSQL(configuration);
            const actual = configuration.tables.length ? sql : query;
            setConfiguration(EMPTY_CONFIGURATION);
            execSQL(actual);
          }}
        >
          <Play />
        </IconButton>
      </Flex>
      <Flex mt={2} sx={{ width: '100%' }} wrap>
        {tableNames?.map((v) => (
          <Chip
            color="secondary"
            variant={
              configuration.tables.some((f) => f.name === v)
                ? 'filled'
                : 'outlined'
            }
            mr={2}
            mb={2}
            onClick={() => addTable(v)}
          >
            {v}
          </Chip>
        ))}
      </Flex>{' '}
      <Dialog {...dialog.state} />
    </>
  );
}

/****************************************************************************************************
 *                                      QueryPane Components
 ****************************************************************************************************/

const QueryFieldName = ({ table, name, alias, last = false }) => {
  const { setTableAlias, setColumnAlias, setColumnSelected } =
    React.useContext(LazyMiltonContext);

  return (
    <span className="snap">
      <a className="x" onClick={() => setColumnSelected(table.name, name)}>
        x
      </a>
      <u className="link" onClick={() => setTableAlias(table.name)}>
        {table.alias}
      </u>
      .<>{name}</>{' '}
      <i>
        <b>as</b>
      </i>{' '}
      <u className="link" onClick={() => setColumnAlias(table.name, name)}>
        {alias}
      </u>
      {!last && ','}
    </span>
  );
};

const QueryFieldList = ({ tables, filter = (f) => !!f.selected }) => {
  return tables.map((table, t) =>
    table.columns
      .filter(filter)
      .map((column, i) => (
        <QueryFieldName
          key={column.name + table.name}
          table={table}
          {...column}
          last={
            t === tables.length - 1 &&
            i === table.columns.filter(filter).length - 1
          }
        />
      ))
  );
};

const QueryJoinStatement = ({ name, alias, destTable, srcCol, destCol }) => {
  const [edit, setEdit] = React.useState({ a: !1, b: !1, c: !1 });
  const toggle = (v) => setEdit((s) => ({ ...s, [v]: !s[v] }));
  const { setTableJoin, tables } = React.useContext(LazyMiltonContext);
  const dest = tables.find((t) => t.name === destTable);
  return (
    <>
      {' '}
      JOIN <TableAlias name={name} alias={alias} />{' '}
      <i>
        <b>ON</b>
      </i>{' '}
      {alias}.
      <ColumnEditField
        name={name}
        open={edit.a}
        value={srcCol}
        toggle={() => toggle('a')}
        onChange={(v) => {
          setTableJoin(name, 'srcCol', v);
          toggle('a');
        }}
      />{' '}
      ={' '}
      <TableEditField
        open={edit.b}
        value={destTable}
        display={dest?.alias}
        toggle={() => toggle('b')}
        onChange={(v) => {
          setTableJoin(name, 'destTable', v);
          toggle('b');
        }}
      />
      .
      <ColumnEditField
        name={destTable}
        open={edit.c}
        value={destCol}
        toggle={() => toggle('c')}
        onChange={(v) => {
          setTableJoin(name, 'destCol', v);
          toggle('c');
        }}
      />
    </>
  );
};

function ColumnEditField({ open, name, onChange, toggle, value }) {
  if (open) {
    return <ColumnList name={name} value={value} onChange={onChange} />;
  }
  return (
    <u className="link red" onClick={toggle}>
      {value || 'set field'}
    </u>
  );
}

function TableEditField({ open, onChange, toggle, value, display }) {
  if (open) {
    return <TableList value={value} onChange={onChange} />;
  }
  return (
    <u className="link red" onClick={toggle}>
      {display || value || 'set table'}
    </u>
  );
}

const TableList = ({ onChange, value }) => {
  const { tables } = React.useContext(LazyMiltonContext);
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      label="Choose table"
      options={tables.map((f) => f.name)}
    />
  );
};

const ColumnList = ({ name, onChange, value }) => {
  const { tables } = React.useContext(LazyMiltonContext);
  if (!name) return <i>table not set</i>;
  const { columns } = tables.find((f) => f.name === name);
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      label="Choose column"
      options={columns.map((f) => f.name)}
    />
  );
};

const TableAlias = ({ name, alias }) => {
  const { setTableAlias } = React.useContext(LazyMiltonContext);
  return (
    <>
      {' '}
      {name}{' '}
      <i>
        <b>as</b>
      </i>{' '}
      <u className="link" onClick={() => setTableAlias(name)}>
        {alias}
      </u>
    </>
  );
};

const QueryTableName = ({ join, name, alias, first = false }) => {
  return (
    <>
      {!first && <QueryJoinStatement name={name} alias={alias} {...join} />}
      {!!first && <TableAlias name={name} alias={alias} />}
    </>
  );
};

const QueryTableList = ({ tables }) => {
  return tables.map((table, t) => (
    <QueryTableName key={table.name} {...table} first={t === 0} />
  ));
};

const QueryTextBox = ({ configuration, value, onChange }) => {
  const { tables, wheres, orders } = configuration;
  if (tables.length) {
    const excluded = tables.filter((f) => !f.selected);
    return (
      <Flex wrap sx={{ lineHeight: 1.5, maxWidth: 'calc(100vw - 500px)' }}>
        <code>
          {' '}
          SELECT <QueryFieldList tables={tables} /> FROM{' '}
          <QueryTableList tables={tables} />
        </code>
        <Card>
          <legend>Available fields</legend>
          <QueryFieldList tables={tables} filter={(f) => !f.selected} />
        </Card>
      </Flex>
    );
  }
  return (
    <TextBox
      multiple
      sx={{ width: '85%' }}
      mr={8}
      rows={3}
      value={value}
      onChange={onChange}
    />
  );
};

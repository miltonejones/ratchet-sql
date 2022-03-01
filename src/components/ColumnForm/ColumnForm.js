import React from 'react';
import {
  TextBox,
  Card,
  Flex,
  Typography,
  Button,
  Switch,
  Box,
  Alert,
} from '../UI/UI';
import { Key, Lock } from '../../icons';

const getType = (type) => {
  const test = /(\w+)\((\d+)\)/.exec(type);
  if (test)
    return {
      type: test[1],
      size: test[2],
    };
  return { type };
};

export default function ColumnForm({ column: inputColumn }) {
  const [column, setColumn] = React.useState(inputColumn);
  React.useEffect(() => {
    !!inputColumn &&
      column?.COLUMN_NAME !== inputColumn.COLUMN_NAME &&
      setColumn(inputColumn);
  }, [column, inputColumn]);
  if (!column) return <i />;
  const update = (n, v) => setColumn({ ...column, [n]: v });
  const dataType = getType(column.COLUMN_TYPE);
  const rows = [
    {
      caption: 'Name',
      field: 'COLUMN_NAME',
      value: column.COLUMN_NAME,
    },
    {
      caption: 'Type',
      value: dataType.type,
    },
    {
      caption: 'Size',
      value: dataType.size,
    },
  ];
  return (
    <>
      <Card mt={5} style={{ maxWidth: 325 }}>
        <legend>"{column.COLUMN_NAME}" settings</legend>
        {!!column.CONSTRAINT_NAME && column.CONSTRAINT_NAME === 'PRIMARY' && (
          <Alert icon={Key}>Primary Key</Alert>
        )}
        {!!column.CONSTRAINT_NAME && column.CONSTRAINT_NAME !== 'PRIMARY' && (
          <Alert icon={Lock} mr={2}>
            <Box>
              foreign key of{' '}
              <i>
                {' '}
                {column.REFERENCED_TABLE_NAME}.{column.REFERENCED_COLUMN_NAME}
              </i>
            </Box>
          </Alert>
        )}
        {rows.map((row) => (
          <Flex spacing={1} mr={2} column>
            <Typography variant="caption">{row.caption}</Typography>
            <TextBox
              placeholder={row.caption}
              value={row.value}
              onChange={(e) => !!row.field && update(row.field, e.target.value)}
            />
          </Flex>
        ))}
        <Flex align="center" spacing={1} mr={2}>
          <Switch
            onChange={(v) => update('IS_NULLABLE', v ? 'YES' : 'NO')}
            checked={column.IS_NULLABLE === 'YES'}
          />{' '}
          Allow null
        </Flex>
      </Card>
    </>
  );
}

import React from 'react';
import { List, Card, Collapse, Flex, Box } from '../UI/UI';
import { Key, Lock } from '../../icons';

export default function ColumnList({ tableName, state, getColumn, columns }) {
  return (
    <>
      <Card style={{ maxWidth: 325 }} mt={1} mb={6}>
        <legend>Columns in {tableName}</legend>
        <List
          dense={!!state.columnName}
          items={columns.map((r) => {
            let Icon = null;
            if (r.CONSTRAINT_NAME) {
              Icon = r.CONSTRAINT_NAME === 'PRIMARY' ? Key : Lock;
            }
            const ok = state.columnName === r.COLUMN_NAME;
            const height = '36px';
            return (
              <Collapse
                height={height}
                noscroll
                on={!state.columnName || ok}
                key={r.COLUMN_NAME}
                onClick={() => getColumn(r.COLUMN_NAME)}
              >
                <Flex
                  key={r.COLUMN_NAME}
                  className={ok ? 'li selected' : 'li'}
                  align="center"
                >
                  {!!Icon && (
                    <Box mr={2}>
                      <Icon />
                    </Box>
                  )}
                  {r.COLUMN_NAME}
                  <Box sx={{ flexGrow: 1 }} />
                  {r.COLUMN_TYPE}
                </Flex>
              </Collapse>
            );
          })}
        />
      </Card>
    </>
  );
}

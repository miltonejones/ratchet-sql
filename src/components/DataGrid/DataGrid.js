import React from 'react';
import { Alert, Box } from '../UI/UI';
import './DataGrid.css';

export default function DataGrid({ table }) {
  const maxWidth = '200px';
  if (!table?.fields) {
    return (
      <Alert severity="error">
        Could not read response. Please try again later
        <Box>{table.error}</Box>
      </Alert>
    );
  }
  return (
    <table
      className="DataGrid"
      style={{ width: '100vw' }}
      columns={table.fields.length}
    >
      <thead>
        {table?.fields?.map((k, i) => (
          <th className="cell" style={{ textAlign: 'left' }}>
            {k.name}
          </th>
        ))}
      </thead>
      {table.rows.map((row, r) => (
        <tr key={r}>
          {Object.keys(row).map((cell, i) => (
            <td
              className="cell"
              style={{ maxWidth, overflow: 'hidden' }}
              key={i}
            >
              <div className="no-wrap">
                {' '}
                <CellValue value={row[cell]} />
              </div>
            </td>
          ))}
        </tr>
      ))}
    </table>
  );
}

const CellValue = ({ value }) => {
  if (!value) return <i>empty</i>;
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
};

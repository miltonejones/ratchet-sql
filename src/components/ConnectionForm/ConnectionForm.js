import React from 'react';
import {
  TextBox,
  Typography,
  Flex,
  Button,
  Switch,
  Box,
  Alert,
  Center,
} from '../UI/UI';

export default function ConnectionForm({
  onSave,
  onCancel,
  state = {},
  setState,
}) {
  //const [state, setState] = React.useState(config);
  const update = (n, v) => setState((s) => ({ ...s, [n]: v }));
  return (
    <>
      <Box column mt={5} style={{ maxWidth: 325 }}>
        <Typography variant="body2" className="bold">
          Enter connection settings
        </Typography>
        <Center column>
          <Flex spacing={1}>
            <TextBox
              placeholder="Connection name"
              fullWidth
              value={state.title}
              onChange={(e) => update('title', e.target.value)}
            />
          </Flex>
          <Flex spacing={1}>
            <TextBox
              placeholder="Host name"
              fullWidth
              value={state.host}
              onChange={(e) => update('host', e.target.value)}
            />
          </Flex>
          <Flex spacing={1}>
            <TextBox
              placeholder="User name"
              fullWidth
              value={state.user}
              onChange={(e) => update('user', e.target.value)}
            />
          </Flex>
          <Flex spacing={1}>
            <TextBox
              fullWidth
              type="password"
              placeholder="Password"
              value={state.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </Flex>
          <Flex spacing={1}>
            <TextBox
              fullWidth
              placeholder="Database"
              value={state.database}
              onChange={(e) => update('database', e.target.value)}
            />
          </Flex>
        </Center>
        <Alert>Saved to localStorage only.</Alert>
        <Flex xs={12}>
          <Flex spacing={1} xs={3}>
            <Button onClick={() => onSave(state)} variant="filled">
              save
            </Button>
          </Flex>
          <Flex spacing={1} xs={9} align="center">
            <Switch
              onChange={(q) => update('connect', q)}
              checked={!!state.connect}
            />{' '}
            <Box
              className="link no-wrap"
              onClick={() => update('connect', !state.connect)}
            >
              Connect on save
            </Box>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}

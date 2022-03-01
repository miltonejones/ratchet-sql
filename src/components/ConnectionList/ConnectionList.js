import React from 'react';
import { List, Card, Flex, Alert } from '../UI/UI';
import { Database, Close, Plus } from '../../icons';

export default function ConnectionList({ state, setState, openConnection }) {
  return (
    <>
      {!state.configs && !Object.keys(state.configs).length && (
        <Alert mb={1} severity="info">
          Add a server to connect
        </Alert>
      )}
      <Card>
        <legend>Connections</legend>
        <List
          items={Object.keys(state.configs)
            .map((key) => (
              <Flex
                align="center"
                className="link li"
                onClick={() => openConnection(key)}
                key={key}
              >
                <Database />
                {key}
              </Flex>
            ))
            .concat(
              <Flex
                onClick={() =>
                  setState({
                    ...state,
                    connectForm: !state.connectForm,
                  })
                }
                align="center"
                className="li link selected"
              >
                {state.connectForm ? <Close /> : <Plus />}
                {state.connectForm ? 'Cancel' : ' Add connection'}
              </Flex>
            )}
        />
      </Card>
    </>
  );
}

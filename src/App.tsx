import React, { useState, useEffect, useReducer } from 'react';

import { Game } from './Board';
import './App.css';
import GameManager from './GameManager';

interface AppProps {}
let players = [
  {
    id: 'p1',
    symbol: 'O',
    name: 'Player 1',
    type: 'preset',
    url: '',
    thinkFn: 'function run(state) {\n return { position: 1 }\n}',
  },
  {
    id: 'p2',
    symbol: 'X',
    name: 'Player 2',
    type: 'preset',
    url: '',
    thinkFn: 'function run(state) {\n return { position: 1 }\n}',
  },
];

let playerReducer = (state, action) => {
  if (action.type.endsWith('_NAME')) {
    return { ...state, name: action.value };
  }

  if (action.type.endsWith('_SYMBOL')) {
    return { ...state, symbol: action.value };
  }

  if (action.type.endsWith('_THINK')) {
    return {
      ...state,
      thinkFn: action.value,
    };
  }

  if (action.type.endsWith('_TYPE')) {
    return { ...state, type: action.value };
  }

  if (action.type.endsWith('_URL')) {
    return { ...state, url: action.value };
  }
  return state;
};

let reducer = (state, action) => {
  if (action.type.startsWith('P1')) {
    return [playerReducer(state[0], action), state[1]];
  } else if (action.type.startsWith('P2')) {
    return [state[0], playerReducer(state[1], action)];
  }

  return state;
};

const PlayerForm = ({ player, dispatch }) => {
  return (
    <div className="player-form">
      <label>
        Name
        <input
          value={player.name}
          onChange={(e) =>
            dispatch({
              type: `${player.id.toUpperCase()}_NAME`,
              value: e.target.value,
            })
          }
        />
      </label>
      <label>
        Symbol
        <input
          value={player.symbol}
          onChange={(e) =>
            dispatch({
              type: `${player.id.toUpperCase()}_SYMBOL`,
              value: e.target.value,
            })
          }
        />
      </label>

      <label>
        Type
        <select
          onChange={(e) =>
            dispatch({
              type: `${player.id.toUpperCase()}_TYPE`,
              value: e.target.value,
            })
          }
        >
          <option value="preset">Preset</option>
          <option value="human">Human</option>
          <option value="gist">Gist</option>
          <option value="custom">Custom</option>
        </select>
      </label>
      {player.type === 'gist' && (
        <label>
          Gist URL
          <input
            value={player.url}
            onChange={(e) =>
              dispatch({
                type: `${player.id.toUpperCase()}_URL`,
                value: e.target.value,
              })
            }
          />
        </label>
      )}

      {player.type === 'custom' && (
        <label>
          Code
          <textarea
            className="code-area"
            value={player.thinkFn}
            onChange={(e) =>
              dispatch({
                type: `${player.id.toUpperCase()}_THINK`,
                value: e.target.value,
              })
            }
          />
        </label>
      )}
    </div>
  );
};

function App({}: AppProps) {
  let [state, dispatch] = useReducer(reducer, players);

  return (
    <div className="app">
      <h1>Tic Tac Toe FIGHT!</h1>
      <Game game={new GameManager(state)} />
      <div className="form">
        <PlayerForm player={state[0]} dispatch={dispatch} />
        <PlayerForm player={state[1]} dispatch={dispatch} />
      </div>
    </div>
  );
}

export default App;

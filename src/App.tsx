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

const Definition = ({ node }) => {
  return (
    <div className="definition-container">
      <DefinitionItem node={node} />
    </div>
  );
};

const DefinitionItem = ({ node }) => {
  let { label, subLabel, description, children } = node;
  return (
    <div className="definition">
      <div className="definition-block">
        <code className="definition-label">{label}</code>
        {subLabel && <span> - {subLabel}</span>}
        <div className="definition-desc">{description}</div>
        {children?.map((child) => (
          <DefinitionItem key={child.label} node={child} />
        ))}
      </div>
    </div>
  );
};

let tree = {
  label: 'state',
  subLabel: <code>{`{cells, history}`}</code>,
  description: 'Game state object',
  children: [
    {
      label: 'cells',
      subLabel: <code>{`{id, symbol}[]`}</code>,
      description: 'Board state represented by an array of cells',
      children: [
        {
          label: 'id',
          subLabel: <code>number</code>,
          description:
            'Cell number, as indicated at the bottom of each cell on the game board',
        },
        {
          label: 'symbol',
          subLabel: <code>string</code>,
          description: 'Player symbol currently occupying the cell',
        },
      ],
    },
    {
      label: 'history',
      subLabel: <code>{`{player, cell, status}[]`}</code>,
      description: 'List of moves taken during the game',
      children: [
        {
          label: 'player',
          subLabel: <code>{`{id, symbol, name}[]`}</code>,
          description: 'Player information',

          children: [
            {
              label: 'id',
              subLabel: <code>string</code>,
              description: 'Player ID',
            },
            {
              label: 'symbol',
              subLabel: <code>string</code>,
              description: 'Symbol used to identify player and mark cells',
            },
            {
              label: 'name',
              subLabel: <code>string</code>,
              description: 'Player name',
            },
          ],
        },
        {
          label: 'cell',
          subLabel: <code>number</code>,
          description: 'Cell ID the player attempted to play on',
        },
        {
          label: 'status',
          subLabel: <code>string("SUCCESS"|"FAILURE")</code>,
          description: `Status of player's move`,
        },
      ],
    },
  ],
};

let answer = {
  label: 'answer',
  subLabel: <code>{`{position}`}</code>,
  description: 'Expected response object',
  children: [
    {
      label: 'position',
      subLabel: <code>number</code>,
      description: 'Cell ID to play on',
    },
  ],
};

const Rules = () => {
  return (
    <div className="rules">
      <label id="rules-link-label" htmlFor="rules-link">
        how to play
      </label>
      <div id="rules">
        <h3>Introduction</h3>
        <p>
          Tic Tac Toe FIGHT is a game where you can pit your own bot against
          another in a Tic Tac Toe showdown!
        </p>
        <p>Begin by selecting the type of player from the dropdown list.</p>
        <ul>
          <li>Human: Play manually as a human player.</li>
        </ul>
        <p>
          All other options are bot (automated) players. The bot is essentially
          a function that takes in the game state and returns the position it
          wants the game to play on. This will be further explained below.
        </p>
        <ul>
          <li>
            Gist: A link to the bot. An easy way to host the code for your bot
            is by using GitHub. Simply provide the link to the raw version of
            the file or gist, like{' '}
            <a
              target="_blank"
              href="https://gist.githubusercontent.com/adrfoong/dad4a17fde19899a55c9e0cadfd86fef/raw/9522bbdc5f33885fbcd1719ab6d704727073cf6f/test.js"
            >
              this
            </a>
            .
          </li>
          <li>
            Custom: Define the function directly in the textbox provided. Not
            quite as user friendly as an editor, but functional.
          </li>
          <li>
            Preset: A pre-defined bot. Chooses the first available cell to play
            on.
          </li>
        </ul>
        <h3>Defining a bot</h3>

        <p>Your bot should look something like this:</p>
        <code>
          {`let bot = (state) => {
            return { position: 1}
          }`}
        </code>
        <p>
          It should accept a <code>state</code> object which holds the
          information it'll need to decide on its move:
        </p>
        <Definition node={tree} />
        <p>
          Remember to return an object, we'll call this object an{' '}
          <code>answer</code>, which will tell the game which cell to play on:
        </p>
        <Definition node={answer} />
      </div>
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
      <input type="checkbox" id="rules-link" />

      <Rules />
    </div>
  );
}

export default App;

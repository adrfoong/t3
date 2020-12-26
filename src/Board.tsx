import React, { useEffect, useRef, useState } from 'react';
import type GameManager from './GameManager';
import './Board.css';
import classnames from 'classnames';

interface CellProps {
  id: number;
  symbol: string;
  updateCell: (id: number) => void;
}

const Cell = ({ id, symbol, updateCell }: CellProps) => {
  return (
    <div
      className={classnames('cell', { occupied: symbol })}
      onClick={() => {
        updateCell(id);
      }}
    >
      <div className="cell-content">{symbol}</div>
      <div className="cell-number">{id}</div>
    </div>
  );
};

interface BoardProps {
  game: GameManager;
  active: boolean;
}

export const Board = ({ game, active }: BoardProps) => {
  return (
    <div
      className={classnames('board', {
        active,
        highlight: active && game.isManualGame,
      })}
    >
      {game.cells.map((cell) => (
        <Cell
          key={cell.id}
          id={cell.id}
          symbol={cell.symbol}
          updateCell={async (id) => {
            game.play(id);
            if (game.player.type !== 'human') {
              await new Promise((r) => setTimeout(r, 500));
              game.runAutomatedPlay();
            }
          }}
        />
      ))}
      {!active && <div className="board-overlay"></div>}
    </div>
  );
};

const History = ({ game }) => {
  return (
    <div className="history">
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Move History</div>
      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Move</th>
              <th>Symbol</th>
              <th>Cell</th>
              <th style={{ width: 87 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {game.history.map(({ cell, player, status }, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{player.symbol}</td>
                <td>{cell}</td>
                <td
                  className={classnames('history-status', {
                    success: status === 'SUCCESS',
                    failure: status === 'FAILURE',
                  })}
                >
                  {status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const Game = ({ game }) => {
  let [, setState] = useState({});
  let [active, setActive] = useState(false);
  useEffect(() => {
    let hooks = {
      onMoveSuccess: () => {
        setState({});
      },
      onMoveFailure: () => {
        setState({});
      },
      onTie: () => {
        setActive(false);
      },
      onWin: (winner) => {
        // setState({});
        setActive(false);
      },
      onReset: () => {
        setState({});
      },
      onSwapStartPlayer: () => {
        setState({});
      },
    };
    game.hooks = hooks;
  }, [game]);
  // let { current: game } = useRef(game);
  return (
    <div className="game">
      <div className="board-space">
        <Board game={game} active={active} />
        <History game={game} />
      </div>
      <div className="info">
        <div>{`${game.startPlayer.name} goes first`}</div>
        {game.hasEnded && (
          <div className="info-win">
            {game.winner ? `${game.winner.name} wins!` : `The game is tied`}
          </div>
        )}
      </div>
      <div className="controls">
        <button
          className="button"
          disabled={active || game.hasEnded}
          type="button"
          onClick={() => {
            setActive(true);
            if (game.isManualGame) {
              game.startManualGame();
            } else {
              game.startAutomatedGame();
            }
          }}
        >
          Start
        </button>
        <button
          className="button"
          disabled={active || game.hasEnded}
          type="button"
          onClick={() => {
            game.swapStartPlayer();
          }}
        >
          Swap Players
        </button>
        <button
          className="button"
          disabled={!game.hasEnded}
          type="button"
          onClick={() => {
            game.reset();
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

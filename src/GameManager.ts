const WIN_STATES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export default class GameManager {
  players: any[];
  player: any;
  startPlayer: any;
  cells: any[];
  winner: any;
  history: any[];
  strikeCount: number;
  hooks: any;

  constructor(players, hooks = {}) {
    this.players = players;
    // this.player = this.players[0];
    this.startPlayer = this.players[0];
    this.cells = Array.from(Array(9).keys()).map((i) => ({
      id: i,
      symbol: '',
    }));
    this.history = [];
    this.strikeCount = 0;

    this.hooks = hooks;
  }

  get isManualGame() {
    return this.players.some((player) => player.type === 'human');
  }

  getThink = async (player) => {
    if (player.type === 'preset') {
      return ({ cells }) => {
        // cells[0].symbol = 'ASDAS';
        return {
          position: cells.findIndex((cell) => !cell.symbol),
        };
      };
    } else if (player.type === 'gist') {
      let func = await fetch(player.url).then((res) => res.text());
      let updated = `let f = ${func}; f;`;
      return eval(updated);
    } else {
      let updated = `let f = ${player.thinkFn}; f;`;
      return eval(updated);
    }
  };

  createThink = async () => {
    let fns = await Promise.all(this.players.map(this.getThink));
    this.players[0].think = fns[0];
    this.players[1].think = fns[1];
  };

  reset() {
    this.cells = Array.from(Array(9).keys()).map((i) => ({
      id: i,
      symbol: '',
    }));
    this.history = [];
    this.strikeCount = 0;
    this.winner = undefined;
    this.player = undefined;
    this.runHook('onReset');
  }

  runHook(type, params?) {
    this.hooks[type]?.(params);
  }

  markCell = (id: number, symbol: string) => {
    let newCells = [...this.cells];
    newCells[id].symbol = symbol;
    this.cells = newCells;
  };

  swapStartPlayer = () => {
    this.startPlayer = this.players.find(
      (player) => player.id !== this.startPlayer.id,
    );
    this.runHook('onSwapStartPlayer');
  };

  swapPlayer = () => {
    this.player = this.players.find((player) => player.id !== this.player.id);
  };

  checkWinner = () => {
    let playerWin = WIN_STATES.some((winCondition) => {
      return winCondition.every(
        (cell) => this.cells[cell].symbol === this.player.symbol,
      );
    });
    if (playerWin) {
      this.winner = this.player;
    }
  };

  get hasEnded() {
    return this.winner || !this.cells.some((cell) => !cell.symbol);
  }

  strike = (id) => {
    this.history.push({ cell: id, player: this.player, status: 'FAILURE' });
    if (this.strikeCount === 2) {
      let otherPlayer = this.players.find(
        (player) => player.id !== this.player.id,
      );
      console.log(`TOO MANY INVALID MOVES. ${otherPlayer.symbol} WINS`);
      this.winner = otherPlayer;
      this.runHook('onWin', { winner: this.winner });
    } else {
      console.log('INVALID MOVE. TRY AGAIN');
      this.strikeCount++;
    }
  };

  updateLoop = (id) => {
    console.log(id, this.player);
    if (this.winner) {
      console.log('GAME ENDED. SKIPPING.');
      return;
    }

    /**
     * Move valid if cell is no already occupied
     */
    let validMove = id >= 0 && id < 9 && !this.cells[id].symbol;
    if (validMove) {
      this.history.push({ cell: id, player: this.player, status: 'SUCCESS' });
      this.markCell(id, this.player.symbol);
      // Reset any previous strike counts
      this.strikeCount = 0;
      this.runHook('onMoveSuccess');
    } else {
      this.strike(id);
      this.runHook('onMoveFailure');

      return;
    }

    // this.markCell(id, this.player.symbol);
    this.checkWinner();

    if (this.hasEnded) {
      if (this.winner) {
        this.runHook('onWin', { winner: this.winner });
        console.log('WE HAVE A WINNER', this.winner.name);
      } else {
        this.runHook('onTie', { winner: this.winner });
        console.log('THE GAME IS TIED');
      }
      console.log('GAME END');
    } else {
      this.swapPlayer();
    }
  };

  play = (id) => {
    this.updateLoop(id);
  };

  getMove = () => {
    // This needs to be deep cloned so that people can't mess with the actual game state
    let state = {
      cells: this.cells.map((cell) => ({ ...cell })),
      history: this.history.map((item) => ({
        ...item,
        player: {
          name: item.player.name,
          symbol: item.player.symbol,
          id: item.player.id,
        },
      })),
    };

    let { position } = this.player.think(state);
    return position;
  };

  runAutomatedPlay = async () => {
    try {
      let position = this.getMove();
      let cell = document.querySelectorAll('.cell')[position];
      cell.classList.add('forced-hover');
      await new Promise((r) => setTimeout(r, 300));
      this.play(position);
    } catch (e) {
      this.strike('ERROR');
      this.runHook('onError', e);
    }
  };

  startAutomatedGame = async () => {
    await this.createThink();
    this.player = this.startPlayer;
    while (!this.winner && !this.hasEnded) {
      await this.runAutomatedPlay();
      await new Promise((r) => setTimeout(r, 500));
    }
  };

  startManualGame = async () => {
    await this.createThink();
    this.player = this.startPlayer;

    if (this.player.type !== 'human') {
      let position = this.getMove();
      this.play(position);
    }
  };
}

// let game = new Game([
//   { id: 'p1', symbol: 'O' },
//   { id: 'p2', symbol: 'X' },
// ]);
// game.play(0);
// game.play(3);
// game.play(1);
// // Invalid move 1
// game.play(1);
// // Invalid move 2
// game.play(1);
// // game.play(1);
// game.play(7);
// game.play(4);
// // Invalid move 1
// game.play(4);
// // Invalid move 2
// game.play(4);
// // Invalid move 3
// game.play(4);
// // O Wins by default
// // Winning move
// game.play(2);

// // Move after game end
// game.play(5);
// console.log(game.history);

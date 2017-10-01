import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {

  render () {
    const classNames = "square" + (this.props.isWinningSquare ? " winning-square" : "");
    
    return (
        <button className={classNames} onClick={this.props.onClick}>
        {this.props.value}
      </button>
    );
  }
}

class Board extends React.Component {  
  renderSquare(row, column) {
    const square = this.props.squares[(3 * row) + column];
    let value, isWinningSquare;
    if (square) {
      value = square.value;
      isWinningSquare = square.isWinningSquare;
    }
    return (
      <Square
        value={value}
        isWinningSquare={isWinningSquare}
        onClick={() => this.props.onClick(row, column)}
      />
    );
  }

  render() {
    const board_rows = [...Array(3)].map((_, row) => {
      const row_squares = [...Array(3)].map(
        (_, column) => this.renderSquare(row, column)
      );
      return <div className="board-row">{row_squares}</div>;
    }).reduce(
      (acc, cur) => acc.concat(cur),
      []
    );
    return <div>{board_rows}</div>;
  }
}

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      movesAscending: true,
    };
  }

  handleClick(row, column) {
    console.log('row ' + row + ' col ' + column);
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[(3 * row) + column]) {
      return;
    }
    squares[(3 * row) + column] = {
      value: this.state.xIsNext ? 'X' : 'O',
      isWinningSquare: false,
    };
    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    console.log('jumping... ' + step);
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  toggleMoveOrder() {
    console.log('toggling');
    this.setState({
      movesAscending: !this.state.movesAscending,
    });
  }
  
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const movesAscending = this.state.movesAscending;
    
    const moves = history.map((step, move) => {
      const desc = move ?
            'Move #' + (move + 1):
            'Game Start';
      let item;
      if (this.state.stepNumber === move) {
        item = (
          <li key={move} className="current-step">
            <a href="#" onClick={() => this.jumpTo(move)}>{desc}</a>
          </li>
        );
      } else {
        item = (
          <li key={move}>
            <a href="#" onClick={() => this.jumpTo(move)}>{desc}</a>
          </li>
        );
      }
      return item;
    });
    if (!movesAscending) { moves.reverse(); }

    const moveOrderButton = <button onClick={() => this.toggleMoveOrder()}>Toggle Move History Order</button>;
    
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(row, column) => this.handleClick(row, column)}
          />
        </div>
        <div className="game-info">
        <div>{status}</div>
        <br></br>
        <div>{moveOrderButton}</div>
        <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ==================================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i].map(
      ([row, column]) => squares[(3 * row) + column]
    );
    if (a && b && c && a.value === b.value && a.value === c.value) {
      a.isWinningSquare = b.isWinningSquare = c.isWinningSquare = true;
      return a.value;
    }
  }
  return null;
}

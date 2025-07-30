import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Theme palette constants (matches requirements).
 */
const PALETTE = {
  accent: "#ffb300",    // orange
  primary: "#1976d2",   // blue
  secondary: "#424242", // dark gray
  bg: "#fff",
  lightBorder: "#e0e0e0",
};

/**
 * Game modes.
 */
const GAME_MODE = {
  LOCAL: "local",
  COMPUTER: "computer",
};

/**
 * Simple Header.
 */
function Header() {
  return (
    <header className="ttt-header">
      <h1>Tic Tac Toe</h1>
      <span className="subtitle">A Modern, Minimalistic Game</span>
    </header>
  );
}

/**
 * Player Indicator component.
 */
function PlayerIndicators({ current, mode }) {
  return (
    <div className="player-indicators">
      <span
        className={`player-label ${
          current === "X" ? "active" : ""
        }`}
      >
        X {mode === GAME_MODE.COMPUTER ? "(You)" : "(P1)"}
      </span>
      <span
        className={`player-label ${
          current === "O" ? "active" : ""
        }`}
      >
        O {mode === GAME_MODE.COMPUTER ? "(Computer)" : "(P2)"}
      </span>
    </div>
  );
}

/**
 * Win/Loss/Draw Display.
 */
function GameStatus({ winner, boardFull, mode }) {
  let msg = "";
  if (winner) {
    if (mode === GAME_MODE.COMPUTER) {
      msg = winner === "X" ? "You Win! 🎉" : "Computer Wins!";
    } else {
      msg = winner === "X" ? "Player 1 Wins!" : "Player 2 Wins!";
    }
  } else if (boardFull) {
    msg = "Draw!";
  } else {
    msg = "";
  }
  return (
    <div
      aria-live="polite"
      className={`game-status${msg ? " visible" : ""}`}
    >
      {msg}
    </div>
  );
}

/**
 * The main Tic Tac Toe board.
 */
function Board({ board, onCellClick, disabled }) {
  return (
    <div className="ttt-board">
      {board.map((val, i) => (
        <button
          key={i}
          className={`ttt-cell ${val ? "filled" : ""}`}
          aria-label={`Cell ${Math.floor(i / 3) + 1},${(i % 3) + 1}${
            val ? " " + val : ""
          }`}
          onClick={() => onCellClick(i)}
          disabled={!!val || disabled}
          tabIndex={0}
        >
          {val}
        </button>
      ))}
    </div>
  );
}

/**
 * Choose Game Mode Dialog.
 */
function GameModeMenu({ mode, setMode, onStart }) {
  return (
    <section className="ttt-mode-menu" data-testid="mode-menu">
      <span className="mode-title">Choose Mode:</span>
      <div className="mode-options">
        <button
          className={`mode-btn${mode === GAME_MODE.LOCAL ? " selected" : ""}`}
          onClick={() => setMode(GAME_MODE.LOCAL)}
        >
          2 Players
        </button>
        <button
          className={`mode-btn${mode === GAME_MODE.COMPUTER ? " selected" : ""}`}
          onClick={() => setMode(GAME_MODE.COMPUTER)}
        >
          Vs Computer
        </button>
      </div>
      <button className="start-btn" onClick={onStart}>
        Start Game
      </button>
    </section>
  );
}

/**
 * Main Game Component Logic.
 *
 * Manages board state, move logic, winner checking, and mode.
 */
// PUBLIC_INTERFACE
function App() {
  // Game states and meta-controls.
  const [mode, setMode] = useState(GAME_MODE.LOCAL);        // Game mode selection
  const [started, setStarted] = useState(false);            // Has game started?
  const [board, setBoard] = useState(Array(9).fill(null));  // Board cells: [null|"X"|"O"]
  const [current, setCurrent] = useState("X");              // Current player ("X"/"O")
  const [winner, setWinner] = useState(null);               // Winner ("X"/"O"/null)
  const [boardFull, setBoardFull] = useState(false);        // True if draw

  useEffect(() => {
    // Only check for winner after a move.
    const win = getWinner(board);
    setWinner(win);
    setBoardFull(!win && isBoardFull(board));
  }, [board]);

  // Computer move, effect only when it's computer's turn, game active.
  useEffect(() => {
    if (
      started &&
      mode === GAME_MODE.COMPUTER &&
      current === "O" &&
      !winner &&
      !boardFull &&
      !board.every(Boolean)
    ) {
      // Artificial brief delay for realism
      const t = setTimeout(() => {
        const idx = getBestMove(board, "O");
        if (idx !== null) handleCellClick(idx);
      }, 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line
  }, [board, current, mode, winner, boardFull, started]);

  /**
   * Reset all game state to start a new game.
   */
  // PUBLIC_INTERFACE
  function handleReset() {
    setBoard(Array(9).fill(null));
    setCurrent("X");
    setWinner(null);
    setBoardFull(false);
    setStarted(false);
    setMode(GAME_MODE.LOCAL);
  }

  /**
   * Start game from mode menu.
   */
  // PUBLIC_INTERFACE
  function startGame() {
    setBoard(Array(9).fill(null));
    setCurrent("X");
    setWinner(null);
    setBoardFull(false);
    setStarted(true);
  }

  /**
   * User clicks cell at index.
   * @param {number} idx
   */
  // PUBLIC_INTERFACE
  function handleCellClick(idx) {
    if (board[idx] || winner || boardFull) return;
    const boardCopy = [...board];
    boardCopy[idx] = current;
    setBoard(boardCopy);
    setCurrent((prev) => (prev === "X" ? "O" : "X"));
  }

  // Keyboard accessibility support (space/enter to mark square).
  function handleBoardKeyDown(e, idx) {
    if ((e.key === " " || e.key === "Enter") && !board[idx] && !winner && !boardFull) {
      handleCellClick(idx);
    }
  }

  return (
    <div className="ttt-app">
      <Header />

      {/* Mode menu if not started */}
      {!started && (
        <GameModeMenu
          mode={mode}
          setMode={setMode}
          onStart={startGame}
        />
      )}

      {/* Main board if in-game */}
      {started && (
        <>
          <main className="ttt-main">
            <PlayerIndicators current={current} mode={mode} />
            <Board
              board={board}
              onCellClick={handleCellClick}
              disabled={!!winner || boardFull || (mode === GAME_MODE.COMPUTER && current === "O")}
            />
            <GameStatus winner={winner} boardFull={boardFull} mode={mode} />
          </main>
          <div className="ttt-reset-row">
            <button className="reset-btn" onClick={handleReset}>
              Reset
            </button>
          </div>
        </>
      )}

      <footer className="ttt-footer">
        <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">
          React Minimal Template
        </a>
      </footer>
    </div>
  );
}

/**
 * Determine the winner for the given board.
 * @param {Array} board - array of 9 elements (null, "X", "O")
 * @returns {"X"|"O"|null}
 */
function getWinner(board) {
  const lines = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

/**
 * Returns true if board is full (draw).
 */
function isBoardFull(board) {
  return board.every((cell) => cell !== null);
}

/**
 * Simple AI: Tries to win, block, or pick random.
 * @param {Array} board
 * @param {"O"} player
 * @returns {number|null}
 */
function getBestMove(board, player) {
  // 1. Win if possible
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const copy = [...board];
      copy[i] = player;
      if (getWinner(copy) === player) return i;
    }
  }
  // 2. Block opponent
  const opp = "X";
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const copy = [...board];
      copy[i] = opp;
      if (getWinner(copy) === opp) return i;
    }
  }
  // 3. Take center
  if (!board[4]) return 4;
  // 4. Pick a random available
  const available = board.map((v, i) => (v ? null : i)).filter((x) => x!==null);
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export default App;

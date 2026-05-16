import React, { useState, useCallback } from 'react'

type Cell = 0 | 1;
type Position = [row: number, col: number];

const DIRECTIONS: Position[] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

const findPathBacktracking = (
  maze: Cell[][],
  row: number,
  col: number,
  destRow: number,
  destCol: number,
  path: Position[],
  visited: boolean[][]
): boolean => {
  if (
    row < 0 || row >= maze.length ||
    col < 0 || col >= maze[0].length ||
    maze[row][col] === 1 ||
    visited[row][col]
  ) {
    return false;
  }

  path.push([row, col]);
  visited[row][col] = true;

  if (row === destRow && col === destCol) {
    return true;
  }

  for (const [dr, dc] of DIRECTIONS) {
    if (findPathBacktracking(maze, row + dr, col + dc, destRow, destCol, path, visited)) {
      return true;
    }
  }

  path.pop();
  return false;
};

interface MazeSolverProps {
  initialMaze?: Cell[][];
}

export const LabirynthWay: React.FC<MazeSolverProps> = ({ initialMaze }) => {
  const defaultMaze: Cell[][] = initialMaze || [
    [0, 0, 0],
    [1, 1, 0],
    [0, 0, 0],
  ];

  const [maze, setMaze] = useState<Cell[][]>(defaultMaze);
  const [path, setPath] = useState<Position[]>([]);
  const [message, setMessage] = useState<string>('');

  const solveMaze = useCallback(() => {
    const rows = maze.length;
    const cols = maze[0].length;
    const visited: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
    const tempPath: Position[] = [];

    const success = findPathBacktracking(
      maze, 0, 0, rows - 1, cols - 1, tempPath, visited
    );

    if (success) {
      setPath(tempPath);
      setMessage(`✅ Путь найден (длина: ${tempPath.length})`);
    } else {
      setPath([]);
      setMessage('❌ Путь не существует');
    }
  }, [maze]);

  const toggleWall = (row: number, col: number) => {
    setMaze(prev => {
      const newMaze = prev.map(r => [...r]);
      newMaze[row][col] = newMaze[row][col] === 0 ? 1 : 0;
      return newMaze;
    });
    setPath([]);
    setMessage('');
  };

  const resetMaze = () => {
    setMaze(defaultMaze.map(row => [...row]));
    setPath([]);
    setMessage('');
  };

  const isOnPath = (row: number, col: number): boolean => {
    return path.some(([r, c]) => r === row && c === col);
  };

  const isStart = (row: number, col: number) => row === 0 && col === 0;
  const isEnd = (row: number, col: number) => row === maze.length - 1 && col === maze[0].length - 1;

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <h3>🧩 Поиск пути в лабиринте (BackTracking)</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${maze[0].length}, 50px)`,
          justifyContent: 'center',
          gap: '2px',
          margin: '20px auto',
        }}
      >
        {maze.map((row, r) =>
          row.map((cell, c) => {
            let backgroundColor = 'white';
            let emoji = '';
            
            if (isStart(r, c)) {
              backgroundColor = '#90EE90';
              emoji = '🚀';
            } else if (isEnd(r, c)) {
              backgroundColor = '#FFB6C1';
              emoji = '🏁';
            } else if (isOnPath(r, c)) {
              backgroundColor = '#FFD700';
              emoji = '⭐';
            } else if (cell === 1) {
              backgroundColor = '#333';
              emoji = '🧱';
            } else if (cell === 0) {
              emoji = '·';
            }

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => toggleWall(r, c)}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor,
                  border: '1px solid #aaa',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {emoji}
              </button>
            );
          })
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <button 
          onClick={solveMaze} 
          style={{ 
            marginRight: 10, 
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔍 Найти путь
        </button>
        <button 
          onClick={resetMaze} 
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Сброс
        </button>
      </div>

      {message && (
        <p style={{ 
          marginTop: 16, 
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: message.includes('✅') ? '#4CAF50' : '#f44336'
        }}>
          {message}
        </p>
      )}
    </div>
  );
};
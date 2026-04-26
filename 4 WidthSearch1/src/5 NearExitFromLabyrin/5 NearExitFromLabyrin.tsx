import React, { useState } from 'react';

interface Position {
  row: number;
  col: number;
}

export const MazeSolver: React.FC = () => {
  // Пример лабиринта из условия
  const initialMaze = [
    [1, 0, 0, 1],
    [0, 0, 1, 0],
    [0, 0, 0, 0],
  ];

  const [maze] = useState<number[][]>(initialMaze);
  const [start, setStart] = useState<Position>({ row: 1, col: 1 });
  const [result, setResult] = useState<{ steps: number; exit: Position | null } | null>(null);

  // Поиск ближайшего выхода (BFS)
  const findNearestExit = (maze: number[][], start: Position): { steps: number; exit: Position | null } => {
    const rows = maze.length;
    const cols = maze[0].length;

    // Проверка, является ли позиция выходом (на границе)
    const isExit = (row: number, col: number): boolean => {
      return row === 0 || row === rows - 1 || col === 0 || col === cols - 1;
    };

    // Проверка, можно ли встать на клетку
    const isValid = (row: number, col: number): boolean => {
      return row >= 0 && row < rows && col >= 0 && col < cols && maze[row][col] === 0;
    };

    // Если стартовая позиция уже выход
    if (isExit(start.row, start.col)) {
      return { steps: 0, exit: start };
    }

    const queue: { pos: Position; dist: number }[] = [{ pos: start, dist: 0 }];
    const visited: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
    visited[start.row][start.col] = true;

    // Направления: вверх, вниз, влево, вправо
    const directions = [
      { row: -1, col: 0 }, // верх
      { row: 1, col: 0 },  // низ
      { row: 0, col: -1 }, // лево
      { row: 0, col: 1 },  // право
    ];

    while (queue.length > 0) {
      const { pos, dist } = queue.shift()!;

      for (const dir of directions) {
        const newRow = pos.row + dir.row;
        const newCol = pos.col + dir.col;

        if (isValid(newRow, newCol) && !visited[newRow][newCol]) {
          // Если дошли до выхода
          if (isExit(newRow, newCol)) {
            return { steps: dist + 1, exit: { row: newRow, col: newCol } };
          }

          visited[newRow][newCol] = true;
          queue.push({ pos: { row: newRow, col: newCol }, dist: dist + 1 });
        }
      }
    }

    return { steps: -1, exit: null }; // Выход не найден
  };

  const handleSolve = () => {
    const answer = findNearestExit(maze, start);
    setResult(answer);
  };

  // Отрисовка лабиринта
  const renderMaze = () => {
    return (
      <div style={{ display: 'inline-block', marginBottom: '20px' }}>
        {maze.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex' }}>
            {row.map((cell, colIndex) => {
              let backgroundColor = '#fff';
              let text = cell.toString();

              if (cell === 1) {
                backgroundColor = '#333'; // стена
                text = '🧱';
              } else if (start.row === rowIndex && start.col === colIndex) {
                backgroundColor = '#4caf50'; // старт
                text = '🚩';
              } else if (result?.exit?.row === rowIndex && result?.exit?.col === colIndex) {
                backgroundColor = '#ff9800'; // выход
                text = '🚪';
              } else if (result && result.steps !== -1 && result.exit) {
                // можно подсветить путь, но для простоты не делаем
              }

              return (
                <div
                  key={colIndex}
                  style={{
                    width: '50px',
                    height: '50px',
                    border: '1px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor,
                    fontWeight: 'bold',
                    fontSize: '24px',
                  }}
                >
                  {text}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Задача: Ближайший выход из лабиринта</h2>
      <p>
        <strong>Условие:</strong> Дана матрица MxN и стартовая позиция.
        Найдите минимальное количество шагов до любого выхода (ячейки на границе матрицы).
        Стены обозначены 1, проходы 0.
      </p>

      <h3>Лабиринт:</h3>
      {renderMaze()}

      <div style={{ marginBottom: '20px' }}>
        <label>
          Стартовая позиция (row, col): &nbsp;
          <input
            type="number"
            value={start.row}
            onChange={(e) => setStart({ ...start, row: parseInt(e.target.value) || 0 })}
            style={{ width: '60px', marginRight: '10px' }}
          />
          <input
            type="number"
            value={start.col}
            onChange={(e) => setStart({ ...start, col: parseInt(e.target.value) || 0 })}
            style={{ width: '60px' }}
          />
        </label>
        <button onClick={handleSolve} style={{ marginLeft: '20px', padding: '5px 15px' }}>
          Найти выход
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          {result.steps !== -1 ? (
            <>
              <p style={{ fontSize: '18px', color: '#2e7d32' }}>
                ✅ <strong>Минимальное количество шагов: {result.steps}</strong>
              </p>
              <p>
                Выход найден в ячейке: ({result.exit!.row}, {result.exit!.col})
              </p>
            </>
          ) : (
            <p style={{ fontSize: '18px', color: '#c62828' }}>
              ❌ Выход не найден!
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <strong>Пример из условия:</strong>
        <pre style={{ background: '#eee', padding: '10px' }}>
          {`maze = [
  [1, 0, 0, 1],
  [0, 0, 1, 0],
  [0, 0, 0, 0]
]
start = (1, 1)
→ Минимальное количество шагов: 2 (выход через (0,1) или (1,0))`}
        </pre>
      </div>
    </div>
  );
};

export default MazeSolver;
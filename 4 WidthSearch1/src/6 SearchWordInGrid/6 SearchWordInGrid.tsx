import React, { useState } from 'react';

const WordSearch: React.FC = () => {
  // Исходные данные из примера
  const initialGrid: string[][] = [
    ['A', 'B', 'C', 'E'],
    ['S', 'F', 'C', 'S'],
    ['A', 'D', 'E', 'E'],
  ];

  const [grid, setGrid] = useState<string[][]>(initialGrid);
  const [word, setWord] = useState<string>('ABCCED');
  const [result, setResult] = useState<boolean | null>(null);
  const [visitedCells, setVisitedCells] = useState<boolean[][]>([]);

  // DFS + Backtracking
  const exist = (board: string[][], word: string): boolean => {
    const rows = board.length;
    const cols = board[0].length;
    const visited: boolean[][] = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(false));

    const dfs = (row: number, col: number, index: number): boolean => {
      // Если дошли до конца слова — слово найдено
      if (index === word.length) return true;
      // Проверка границ и условий
      if (
        row < 0 ||
        row >= rows ||
        col < 0 ||
        col >= cols ||
        visited[row][col] ||
        board[row][col] !== word[index]
      ) {
        return false;
      }

      // Помечаем клетку как посещённую
      visited[row][col] = true;

      // Рекурсивно проверяем 4 соседних направления
      const found =
        dfs(row + 1, col, index + 1) ||
        dfs(row - 1, col, index + 1) ||
        dfs(row, col + 1, index + 1) ||
        dfs(row, col - 1, index + 1);

      // Backtracking — снимаем отметку
      visited[row][col] = false;

      return found;
    };

    // Перебираем все возможные стартовые клетки
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (dfs(i, j, 0)) {
          // Сохраняем маршрут для визуализации (опционально)
          setVisitedCells(visited.map(row => [...row]));
          return true;
        }
      }
    }
    return false;
  };

  const handleCheck = () => {
    const res = exist(grid, word);
    setResult(res);
  };

  const handleGridChange = (row: number, col: number, value: string) => {
    const newGrid = [...grid];
    newGrid[row][col] = value.toUpperCase();
    setGrid(newGrid);
    setResult(null);
    setVisitedCells([]);
  };

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWord(e.target.value.toUpperCase());
    setResult(null);
    setVisitedCells([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>📐 Поиск слова в сетке (DFS + Backtracking)</h2>
      <p style={{ fontSize: '14px', color: '#555' }}>
        Задача дискретной математики: обход графа (сетки) в глубину с возвратом.
        Можно двигаться ↑ ↓ ← → без повторного использования клеток.
      </p>

      {/* Редактируемая сетка */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Сетка {grid.length}x{grid[0].length}</h3>
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>
            {grid.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => {
                  const isVisited = visitedCells[i]?.[j];
                  return (
                    <td key={j}>
                      <input
                        type="text"
                        maxLength={1}
                        value={cell}
                        onChange={(e) => handleGridChange(i, j, e.target.value)}
                        style={{
                          width: '50px',
                          height: '50px',
                          textAlign: 'center',
                          fontSize: '20px',
                          fontWeight: 'bold',
                          margin: '2px',
                          border: isVisited ? '3px solid #4caf50' : '1px solid #ccc',
                          backgroundColor: isVisited ? '#e8f5e9' : 'white',
                          borderRadius: '8px',
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ввод слова */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>🔍 Слово:</label>
        <input
          type="text"
          value={word}
          onChange={handleWordChange}
          placeholder="Введите слово заглавными буквами"
          style={{
            padding: '8px',
            fontSize: '16px',
            width: '200px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      {/* Кнопка проверки */}
      <button
        onClick={handleCheck}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#2196f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        Найти слово
      </button>

      {/* Результат */}
      {result !== null && (
        <div
          style={{
            padding: '15px',
            backgroundColor: result ? '#d4edda' : '#f8d7da',
            color: result ? '#155724' : '#721c24',
            borderRadius: '8px',
            border: `1px solid ${result ? '#c3e6cb' : '#f5c6cb'}`,
          }}
        >
          <strong>{result ? '✅ true' : '❌ false'}</strong>
          <br />
          {result
            ? `Слово "${word}" найдено в сетке (зелёные клетки — пример маршрута).`
            : `Слово "${word}" не найдено. Попробуйте другое слово или измените сетку.`}
        </div>
      )}

      {/* Пояснение */}
      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666', borderTop: '1px solid #eee', paddingTop: '15px' }}>
        <h4>📌 Алгоритм (дискретная математика):</h4>
        <ul>
          <li>Сетка букв — это <strong>неориентированный граф</strong>, где клетки — вершины, а соседние клетки — рёбра.</li>
          <li>Поиск пути (слова) — это <strong>обход в глубину (DFS)</strong> с ограничением на повторное использование вершин.</li>
          <li><strong>Backtracking</strong>: если путь не привёл к решению, откатываемся и пробуем другой вариант.</li>
          <li>Сложность: O(M × N × 4^L), где L — длина слова, 4 — варианты направлений.</li>
        </ul>
        <p>
          <strong>Пример из условия:</strong> ABCCED → true (маршрут: (0,0) → (0,1) → (0,2) → (1,2) → (2,2) → (2,1) или др.)
        </p>
      </div>
    </div>
  );
};

export default WordSearch;
import { useState, useCallback } from 'react'

export const PermutationsGenerator: React.FC = () => {
  const [input, setInput] = useState<string>('1,2,3');
  const [result, setResult] = useState<number[][]>([]);

  const backtrack = useCallback((
    nums: number[],
    current: number[],
    used: boolean[],
    allPermutations: number[][]
  ) => {
    if (current.length === nums.length) {
      allPermutations.push([...current]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (!used[i]) {
        used[i] = true;
        current.push(nums[i]);

        backtrack(nums, current, used, allPermutations);
        
        current.pop();
        used[i] = false;
      }
    }
  }, []);

  const generatePermutations = useCallback(() => {
    const nums = input.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));

    if (nums.length === 0) return;

    const permutations: number[][] = [];
    const used: boolean[] = new Array(nums.length).fill(false);
    
    backtrack(nums, [], used, permutations);
    setResult(permutations);
  }, [input, backtrack]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Генератор перестановок (Backtracking)</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label>
          Введите числа через запятую:
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
            placeholder="Пример: 1,2,3"
          />
        </label>
        <button 
          onClick={generatePermutations}
          style={{ marginLeft: '10px', padding: '5px 10px' }}
        >
          Сгенерировать перестановки
        </button>
      </div>

      {result.length > 0 && (
        <div>
          <h3>Все перестановки (всего: {result.length}):</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {result.map((perm, idx) => (
              <div 
                key={idx} 
                style={{
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#f5f5f5'
                }}
              >
                [{perm.join(', ')}]
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PermutationsGenerator;
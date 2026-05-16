import { useCallback, useState } from 'react'

interface UseSubsetsReturn {
  generateAll: (nums: number[]) => number[][];
  getCount: (n: number) => number;
}

const useSubsets = (): UseSubsetsReturn => {
  const backtrack = useCallback((
    nums: number[],
    startIndex: number,
    current: number[],
    result: number[][]
  ) => {
    result.push([...current]);
    
    for (let i = startIndex; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(nums, i + 1, current, result);
      current.pop();
    }
  }, []);

  const generateAll = useCallback((nums: number[]): number[][] => {
    if (!nums.length) return [[]];
    
    const result: number[][] = [];
    backtrack(nums, 0, [], result);
    return result;
  }, [backtrack]);

  const getCount = useCallback((n: number): number => {
    return Math.pow(2, n);
  }, []);

  return { generateAll, getCount };
};

export const SubsetsVisualDemo: React.FC = () => {
  const [nums, setNums] = useState<number[]>([1, 2, 3]);
  const [subsets, setSubsets] = useState<number[][]>([]);
  const { generateAll, getCount } = useSubsets();

  const handleGenerate = useCallback(() => {
    const allSubsets = generateAll(nums);
    setSubsets(allSubsets);
  }, [nums, generateAll]);

  const groupedBySize = subsets.reduce((acc, subset) => {
    const size = subset.length;

    if (!acc[size]) acc[size] = [];

    acc[size].push(subset);

    return acc;
    
  }, {} as Record<number, number[][]>);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Все подмножества множества [{nums.join(', ')}]</h2>
      <button onClick={handleGenerate}>Сгенерировать</button>
      
      {Object.entries(groupedBySize).map(([size, subsetsOfSize]) => (
        <div key={size} style={{ marginTop: '15px' }}>
          <h3>Подмножества размера {size}: ({subsetsOfSize.length})</h3>
          <div style={{ gap: '10px', flexWrap: 'wrap' }}>
            {subsetsOfSize.map((subset, idx) => (
              <div key={idx} style={{
                padding: '6px 12px',
                background: '#f0f0f0',
                borderRadius: '4px'
              }}>
                {subset.length === 0 ? '∅' : `{${subset.join(', ')}}`}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <p style={{ marginTop: '20px', color: '#666' }}>
        Всего подмножеств: {getCount(nums.length)} = 2^{nums.length}
      </p>
    </div>
  );
};
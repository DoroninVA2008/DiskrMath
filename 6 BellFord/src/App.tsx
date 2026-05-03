import './App.css'
import ShortestPathFinder from './1 ShortestPathFinder/1 ShortestPathFinder'
import NegantiveCycle from './2 NegantivCycle/2 NegantivCycle'
import ShortNegantivEdgest from './3 ShortNegantivEdgest/3 ShortNegantivEdgest'
import AdjacensMatrix from './4 AdjacensMatrix/4 AdjacensMatrix'
import RestorPath from './5 RestorPath/5 RestorPath'
import UNegantivCycle from './6 UnattaiNegantivCycle/6 UnattaiNegantivCycle'
import ComparDijkstra from './7 ComparDijkstra/7 ComparDijkstra'
import MultUpdates from './8 MultUpdates/8 MultUpdates'
import NegantivEdges from './9 NegantivEdges/9 NegantivEdges'

function App() {
  return (
    <>
      <h1>Алгоритм Беллмана–Форда</h1>

      <section>
        <h2>1. Нахождение кратчайшего пути</h2>
        <ShortestPathFinder />
      </section>

      <section>
        <h2>2. Обнаружение отрицательного цикла</h2>
        <NegantiveCycle />
      </section>

      <section>
        <h2>3. Кратчайший путь с отрицательными рёбрами</h2>
        <ShortNegantivEdgest />
      </section>

      <section>
        <h2>4. Матрица смежности</h2>
        <AdjacensMatrix />
      </section>

      <section>
        <h2>5. Восстановление пути</h2>
        <RestorPath />
      </section>

      <section>
        <h2>6. Недостижимые вершины и отрицательный цикл</h2>
        <UNegantivCycle />
      </section>

      <section>
        <h2>7. Сравнение с Дейкстрой</h2>
        <ComparDijkstra />
      </section>

      <section>
        <h2>8. Множественные обновления</h2>
        <MultUpdates />
      </section>

      <section>
        <h2>9. Отрицательные рёбра</h2>
        <NegantivEdges />
      </section>
    </>
  )
}

export default App

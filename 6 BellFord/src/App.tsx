import { BrowserRouter, Routes, Route, NavLink, Navigate, Outlet } from 'react-router-dom'
import ShortestPathFinder from './1 ShortestPathFinder/1 ShortestPathFinder'
import NegantiveCycle from './2 NegantivCycle/2 NegantivCycle'
import ShortNegantivEdgest from './3 ShortNegantivEdgest/3 ShortNegantivEdgest'
import AdjacensMatrix from './4 AdjacensMatrix/4 AdjacensMatrix'
import RestorPath from './5 RestorPath/5 RestorPath'
import UNegantivCycle from './6 UnattaiNegantivCycle/6 UnattaiNegantivCycle'
import ComparDijkstra from './7 ComparDijkstra/7 ComparDijkstra'
import MultUpdates from './8 MultUpdates/8 MultUpdates'
import NegantivEdges from './9 NegantivEdges/9 NegantivEdges'

const ROUTES = [
  { path: '1', label: '1. Кратчайший путь',              component: ShortestPathFinder },
  { path: '2', label: '2. Отрицательный цикл',           component: NegantiveCycle },
  { path: '3', label: '3. Путь с отриц. рёбрами',        component: ShortNegantivEdgest },
  { path: '4', label: '4. Матрица смежности',            component: AdjacensMatrix },
  { path: '5', label: '5. Восстановление пути',          component: RestorPath },
  { path: '6', label: '6. Недостижимые + отриц. цикл',  component: UNegantivCycle },
  { path: '7', label: '7. Сравнение с Дейкстрой',        component: ComparDijkstra },
  { path: '8', label: '8. Множественные обновления',     component: MultUpdates },
  { path: '9', label: '9. Отрицательные рёбра',          component: NegantivEdges },
]

function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{
        width: 240,
        flexShrink: 0,
        background: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
      }}>
        <div style={{
          padding: '0 16px 20px',
          color: '#60a5fa',
          fontSize: 14,
          fontWeight: 'bold',
          borderBottom: '1px solid #334155',
          marginBottom: 8,
        }}>
          Беллман–Форд
        </div>

        {ROUTES.map(route => (
          <NavLink
            key={route.path}
            to={`/${route.path}`}
            style={({ isActive }) => ({
              display: 'block',
              padding: '10px 16px',
              color: isActive ? '#fff' : '#94a3b8',
              background: isActive ? '#2563eb' : 'transparent',
              textDecoration: 'none',
              fontSize: 13,
              borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent',
            })}
          >
            {route.label}
          </NavLink>
        ))}
      </nav>

      <main style={{ flex: 1, overflowY: 'auto', background: '#f0f4f8' }}>
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/1" replace />} />
          {ROUTES.map(route => (
            <Route key={route.path} path={route.path} element={<route.component />} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

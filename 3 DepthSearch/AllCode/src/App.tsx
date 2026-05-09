import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import TraverDepTree from './1TraverDepTree/1TraverDepTree'
import SumAllNodes from './2SumVallNodes/2SumVallNodes'
import MaxDepTree from './3MaxDepTree/3MaxDepTree'
import MiReflecTree from './4MiReflecTree/4MiReflecTree'
import FindElemenTree from './5FindElemenTree/5FindElemenTree'
import FindWayOutLabyrin from './6FindWayOutLabyrin/6FindWayOutLabyrin'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<TraverDepTree />} />
        <Route path="/1sTask" element={<TraverDepTree />} />
        <Route path="/2nTask" element={<SumAllNodes />} />
        <Route path="/3rTask" element={<MaxDepTree />} />
        <Route path="/4rTask" element={<MiReflecTree />} />
        <Route path="/5hTask" element={<FindElemenTree />} />
        <Route path="/6hTask" element={<FindWayOutLabyrin />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
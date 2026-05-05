import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './algos.css'
import Task1 from './1NearNeibor/1NearNeibor'
import Task2 from './2MinSurvivalTree/2MinSurvivalTree'
import Task3 from './3MethodsOfClassBST/3MethodsOfClassBST'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Task1 />} />
        <Route path="/1sTask" element={<Task1 />} />
        <Route path="/2nTask" element={<Task2 />} />
        <Route path="/3rTask" element={<Task3 />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)

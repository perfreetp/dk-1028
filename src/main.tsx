import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import InspectionPlans from './pages/InspectionPlans'
import CameraPoints from './pages/CameraPoints'
import SamplingTasks from './pages/SamplingTasks'
import IssueReview from './pages/IssueReview'
import WorkOrders from './pages/WorkOrders'
import Reports from './pages/Reports'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="plans" element={<InspectionPlans />} />
          <Route path="points" element={<CameraPoints />} />
          <Route path="tasks" element={<SamplingTasks />} />
          <Route path="review" element={<IssueReview />} />
          <Route path="workorders" element={<WorkOrders />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

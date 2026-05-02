import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/app-layout'
import NotMatch from './pages/NotMatch'
import Dashboard from './pages/Dashboard'
import Analyzer from './pages/Analyzer'
import History from './pages/History'
import Learn from './pages/Learn'

export default function Router() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="" element={<Dashboard />} />
                <Route path="analyze" element={<Analyzer />} />
                <Route path="history" element={<History />} />
                <Route path="learn" element={<Learn />} />
                <Route path="*" element={<NotMatch />} />
            </Route>
        </Routes>
    )
}

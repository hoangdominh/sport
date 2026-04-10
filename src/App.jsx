import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import PageWrapper from './components/layout/PageWrapper';
import OverviewPage from './pages/OverviewPage';
import ExpensePage from './pages/ExpensePage';
import MembersPage from './pages/MembersPage';
import SessionPage from './pages/SessionPage';
import { SportProvider } from './context/SportContext';

export default function App() {
  return (
    <BrowserRouter>
      <SportProvider>
        {/* Background gradient mesh */}
        <div className="gradient-mesh" />
        
        <Navbar />
        <PageWrapper>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/expenses" element={<ExpensePage />} />
            <Route path="/session/:id" element={<SessionPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageWrapper>
      </SportProvider>
    </BrowserRouter>
  );
}
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import { AdminLogin } from './pages/admin/Login.tsx';
import { AdminLayout } from './components/admin/AdminLayout.tsx';
import { ProtectedRoute } from './components/admin/ProtectedRoute.tsx';
import { RoleGate } from './components/admin/RoleGate.tsx';
import { AdminDashboard } from './pages/admin/Dashboard.tsx';
import { AdminSubmissions } from './pages/admin/Submissions.tsx';
import { SubmissionDetail } from './pages/admin/SubmissionDetail.tsx';
import { AdminClients } from './pages/admin/Clients.tsx';
import { ClientDetail } from './pages/admin/ClientDetail.tsx';
import { AdminQuestions } from './pages/admin/Questions.tsx';
import { AdminRules } from './pages/admin/Rules.tsx';
import { AdminSettings } from './pages/admin/Settings.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="submissions" element={<AdminSubmissions />} />
          <Route path="submissions/:id" element={<SubmissionDetail />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route
            path="questions"
            element={
              <RoleGate permission="manage_questions">
                <AdminQuestions />
              </RoleGate>
            }
          />
          <Route
            path="rules"
            element={
              <RoleGate permission="manage_questions">
                <AdminRules />
              </RoleGate>
            }
          />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

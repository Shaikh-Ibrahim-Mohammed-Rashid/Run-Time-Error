import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { ThemeProvider } from './context/ThemeContext';
import { TourProvider } from './context/TourContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';
import AuthComponent from './components/AuthComponent';
import DashboardLayout from './components/DashboardLayout';
import Chatbot from './pages/Chatbot';
import UserInfo from './pages/UserInfo';
import Reports from './pages/Reports';
import Appointments from './pages/Appointments';
import Notifications from './pages/Notifications';
import Goals from './pages/Goals';
import LiveHealth from './pages/LiveHealth';
import Diagnosis from './pages/Diagnosis';
import HealthPlan from './pages/HealthPlan';
import MRIScan from './pages/MRIScan';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App = () => {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider>
        <TourProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Routes>
                <Route path="/" element={<><LandingPage /></>} />
                <Route path="/sign-in" element={<AuthComponent />} />
                <Route path="/sign-up" element={<AuthComponent />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/profile" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Profile />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/chatbot" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Chatbot />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/userinfo" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <UserInfo />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/reports" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Reports />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/notifications" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Notifications />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/appointments" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Appointments />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/goals" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Goals />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/live" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <LiveHealth />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/diagnosis" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Diagnosis />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/health-plan" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <HealthPlan />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/mri-scan" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <MRIScan />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </TourProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
};

export default App;
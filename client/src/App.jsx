import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import GoalDetail from './pages/GoalDetail';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import Login from './pages/Login';
import Register from './pages/Register';
import { isAuthenticated } from './services/api';

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const App = () => {
  const location = useLocation();
  const authPath = location.pathname === '/login' || location.pathname === '/register';

  if (authPath) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_20%_10%,#dbeafe_0%,#f6f7fb_45%,#eef2ff_100%)] px-4 py-8">
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_1fr]">
      <Sidebar />
      <div className="min-h-screen">
        <Navbar />
        <main className="px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8 lg:pt-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/goals"
              element={
                <ProtectedRoute>
                  <Goals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/goals/:goalId"
              element={
                <ProtectedRoute>
                  <GoalDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {isAuthenticated() ? <MobileNav /> : null}
    </div>
  );
};

export default App;


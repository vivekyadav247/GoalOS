import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Show, useAuth, useUser } from '@clerk/react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import GoalDetail from './pages/GoalDetail';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';
import { clearClerkTokenGetter, setClerkTokenGetter } from './services/api';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppShell = () => {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_1fr]">
      <Sidebar />
      <div className="min-h-screen">
        <Navbar />
        <main className="px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8 lg:pt-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/goals/:goalId" element={<GoalDetail />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <Show when="signed-in">
        <MobileNav />
      </Show>
    </div>
  );
};

const App = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    setClerkTokenGetter(() => getToken());

    return () => {
      clearClerkTokenGetter();
    };
  }, [getToken]);

  if (!isLoaded) {
    return null;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isSignedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;

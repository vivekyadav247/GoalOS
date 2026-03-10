import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Show, useAuth, useUser } from '@clerk/react';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import Home from './pages/Home';
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
    <div className="min-h-screen">
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 overflow-x-hidden pb-24 pt-4 md:pb-8 md:pt-6">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/goals/:goalId" element={<GoalDetail />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
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
          isSignedIn ? (
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          ) : (
            <LandingPage />
          )
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

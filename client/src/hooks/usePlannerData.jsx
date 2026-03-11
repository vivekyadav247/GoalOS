import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage, plannerApi } from '../services/api';

const emptyState = {
  goals: [],
  monthsByGoal: {},
  months: [],
  weeksByMonth: {},
  weeks: [],
  tasksByWeek: {},
  tasks: [],
  monthToGoal: {},
  weekToMonth: {}
};

const PlannerDataContext = createContext(null);

const usePlannerDataState = () => {
  const [data, setData] = useState(emptyState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    const shouldShowLoader = !hasLoadedRef.current;
    if (shouldShowLoader) {
      setLoading(true);
    }
    setError('');

    try {
      const next = await plannerApi.getAllHierarchy();
      setData({ ...emptyState, ...next });
      hasLoadedRef.current = true;
      return next;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load planner data'));
      throw err;
    } finally {
      if (shouldShowLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleRefresh = () => {
      refresh().catch(() => {});
    };

    window.addEventListener('planner:refresh', handleRefresh);

    return () => window.removeEventListener('planner:refresh', handleRefresh);
  }, [refresh]);

  return {
    ...data,
    loading,
    error,
    refresh,
    setData
  };
};

export const PlannerDataProvider = ({ children }) => {
  const value = usePlannerDataState();
  return <PlannerDataContext.Provider value={value}>{children}</PlannerDataContext.Provider>;
};

const usePlannerData = () => {
  const context = useContext(PlannerDataContext);
  if (!context) {
    throw new Error('usePlannerData must be used within PlannerDataProvider');
  }
  return context;
};

export default usePlannerData;

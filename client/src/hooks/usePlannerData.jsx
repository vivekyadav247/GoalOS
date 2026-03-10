import { createContext, useCallback, useContext, useEffect, useState } from 'react';
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

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const next = await plannerApi.getAllHierarchy();
      setData({ ...emptyState, ...next });
      return next;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load planner data'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
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

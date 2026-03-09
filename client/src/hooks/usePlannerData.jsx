import { useCallback, useEffect, useState } from 'react';
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

const usePlannerData = () => {
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

export default usePlannerData;


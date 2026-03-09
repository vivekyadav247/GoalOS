import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage, plannerApi } from '../services/api';

const emptyState = {
  goals: [],
  goal: null,
  months: [],
  weeksByMonth: {},
  weeks: [],
  tasksByWeek: {},
  tasks: []
};

const useGoalHierarchy = (goalId) => {
  const [data, setData] = useState(emptyState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!goalId) {
      setData(emptyState);
      setLoading(false);
      return emptyState;
    }

    setLoading(true);
    setError('');

    try {
      const next = await plannerApi.getGoalHierarchy(goalId);
      setData({ ...emptyState, ...next });
      return next;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load goal details'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [goalId]);

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

export default useGoalHierarchy;


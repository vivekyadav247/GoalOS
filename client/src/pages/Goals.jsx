import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoalCard from '../components/GoalCard';
import CreateGoalModal from '../components/CreateGoalModal';
import { getApiErrorMessage, goalApi } from '../services/api';
import usePlannerData from '../hooks/usePlannerData';

const Goals = () => {
  const navigate = useNavigate();
  const {
    goals,
    tasks,
    weekToMonth,
    monthToGoal,
    loading,
    error,
    refresh
  } = usePlannerData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [deletingGoalId, setDeletingGoalId] = useState('');

  const goalStats = useMemo(() => {
    const byGoal = {};

    for (const task of tasks) {
      const monthId = weekToMonth[task.weekId];
      const goalId = monthToGoal[monthId];
      if (!goalId) {
        continue;
      }

      if (!byGoal[goalId]) {
        byGoal[goalId] = { total: 0, completed: 0 };
      }

      byGoal[goalId].total += 1;
      if (task.completed) {
        byGoal[goalId].completed += 1;
      }
    }

    return byGoal;
  }, [tasks, weekToMonth, monthToGoal]);

  const handleSaveGoal = async (payload) => {
    setModalLoading(true);
    setActionError('');

    try {
      if (editingGoal?._id) {
        await goalApi.updateGoal(editingGoal._id, payload);
      } else {
        await goalApi.createGoal(payload);
      }
      setModalOpen(false);
      setEditingGoal(null);
      await refresh();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Unable to save goal'));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    const confirmed = window.confirm('Delete this goal? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    setDeletingGoalId(goalId);
    setActionError('');

    try {
      await goalApi.deleteGoal(goalId);
      await refresh();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Unable to delete goal'));
    } finally {
      setDeletingGoalId('');
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="page-title">Goals</h2>
          <p className="page-subtitle">View and manage your long-term goals in one place.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingGoal(null);
            setModalOpen(true);
          }}
        >
          Create Goal
        </button>
      </section>

      {error ? <div className="surface-card p-4 text-sm text-rose-700">{error}</div> : null}
      {actionError ? <div className="surface-card p-4 text-sm text-rose-700">{actionError}</div> : null}

      {loading ? (
        <div className="surface-card p-6 text-sm text-slate-500">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="surface-card p-6 text-sm text-slate-500">No goals available yet.</div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => {
            const stats = goalStats[goal._id] || { total: 0, completed: 0 };
            const progress = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

            return (
              <GoalCard
                key={goal._id}
                title={goal.title}
                category={goal.category}
                progress={progress}
                tasksCompleted={stats.completed}
                onClick={() => navigate(`/goals/${goal._id}`)}
                actions={
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="btn-secondary px-3 py-1.5 text-xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditingGoal(goal);
                        setModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                      disabled={deletingGoalId === goal._id}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteGoal(goal._id);
                      }}
                    >
                      {deletingGoalId === goal._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                }
              />
            );
          })}
        </section>
      )}

      <CreateGoalModal
        open={modalOpen}
        loading={modalLoading}
        initialValue={editingGoal}
        onClose={() => {
          setModalOpen(false);
          setEditingGoal(null);
        }}
        onSubmit={handleSaveGoal}
      />
    </div>
  );
};

export default Goals;


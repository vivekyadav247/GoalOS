import axios from 'axios';

export const TOKEN_KEY = 'goalos_token';
export const USER_KEY = 'goalos_user';

const hasWindow = typeof window !== 'undefined';

const storage = {
  get(key) {
    if (!hasWindow) {
      return null;
    }
    return window.localStorage.getItem(key);
  },
  set(key, value) {
    if (!hasWindow) {
      return;
    }
    window.localStorage.setItem(key, value);
  },
  remove(key) {
    if (!hasWindow) {
      return;
    }
    window.localStorage.removeItem(key);
  }
};

// Legacy helpers kept for backward compatibility with old pages.
export const getAuthToken = () => storage.get(TOKEN_KEY);

export const getAuthUser = () => {
  const rawUser = storage.get(USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (_error) {
    return null;
  }
};

export const setAuthSession = ({ token, user }) => {
  if (token) {
    storage.set(TOKEN_KEY, token);
  }
  if (user) {
    storage.set(USER_KEY, JSON.stringify(user));
  }
};

export const clearAuthSession = () => {
  storage.remove(TOKEN_KEY);
  storage.remove(USER_KEY);
};

export const isAuthenticated = () => Boolean(getAuthToken());

let clerkTokenGetter = null;

export const setClerkTokenGetter = (getter) => {
  clerkTokenGetter = typeof getter === 'function' ? getter : null;
};

export const clearClerkTokenGetter = () => {
  clerkTokenGetter = null;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000
});

api.interceptors.request.use(async (config) => {
  let token = null;

  if (typeof clerkTokenGetter === 'function') {
    try {
      token = await clerkTokenGetter();
    } catch (_error) {
      token = null;
    }
  }

  if (!token) {
    token = getAuthToken();
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

const unwrap = (promise) => promise.then((res) => res.data);
const asArray = (value) => (Array.isArray(value) ? value : []);

export const getApiErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.message || error?.message || fallback;

export const authApi = {
  register: (payload) => unwrap(api.post('/auth/register', payload)),
  login: (payload) => unwrap(api.post('/auth/login', payload))
};

export const goalApi = {
  getGoals: () => unwrap(api.get('/goals')),
  createGoal: (payload) => unwrap(api.post('/goals', payload)),
  updateGoal: (id, payload) => unwrap(api.put(`/goals/${id}`, payload)),
  deleteGoal: (id) => unwrap(api.delete(`/goals/${id}`))
};

export const taskApi = {
  getAll: () => unwrap(api.get('/tasks')),
  getToday: () => unwrap(api.get('/tasks/today')),
  getByGoal: (goalId, params = {}) => unwrap(api.get(`/tasks/goal/${goalId}`, { params })),
  create: (payload) => unwrap(api.post('/tasks', payload)),
  update: (id, payload) => unwrap(api.put(`/tasks/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/tasks/${id}`)),
  toggleComplete: (id, completed) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const clientDate = `${year}-${month}-${day}`;
    return unwrap(api.put(`/tasks/${id}`, { completed, clientDate }));
  }
};

export const weekApi = {
  applyPattern: (payload) => unwrap(api.post('/weeks/pattern', payload))
};

const startOfWeek = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfWeek = (date) => {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const weekKey = (startDate) => startDate.toISOString().slice(0, 10);

const sortByKey = (a, b) => (a._id > b._id ? 1 : -1);

export const getMonthsBetweenDates = (rangeStart, rangeEnd) => {
  const months = [];
  if (!rangeStart || !rangeEnd) {
    return months;
  }

  const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  const lastMonth = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);

  while (cursor <= lastMonth) {
    const key = monthKey(cursor);
    months.push({
      _id: key,
      monthName: cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
};

export const getCalendarWeeks = (rangeStart, rangeEnd) => {
  const weeks = [];
  if (!rangeStart || !rangeEnd) {
    return weeks;
  }

  const firstWeekStart = startOfWeek(rangeStart);
  const lastWeekEnd = endOfWeek(rangeEnd);

  for (
    let cursor = new Date(firstWeekStart);
    cursor <= lastWeekEnd;
    cursor.setDate(cursor.getDate() + 7)
  ) {
    const start = new Date(cursor);
    const end = endOfWeek(start);
    const key = weekKey(start);
    weeks.push({
      _id: key,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    });
  }

  return weeks;
};

export const groupTasksByWeek = (tasks) => {
  const tasksByWeek = {};
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return tasksByWeek;
  }

  for (const task of tasks) {
    if (!task.date) continue;
    const date = new Date(task.date);
    if (Number.isNaN(date.getTime())) continue;
    const start = startOfWeek(date);
    const key = weekKey(start);
    if (!tasksByWeek[key]) {
      tasksByWeek[key] = [];
    }
    tasksByWeek[key].push(task);
  }

  return tasksByWeek;
};

export const plannerApi = {
  async getGoalHierarchy(goalId) {
    const allGoals = asArray(await goalApi.getGoals());
    const goal = allGoals.find((item) => item._id === goalId) || null;

    if (!goal) {
      return {
        goals: allGoals,
        goal: null,
        months: [],
        weeksByMonth: {},
        weeks: [],
        tasksByWeek: {},
        tasks: []
      };
    }

    const tasks = asArray(await taskApi.getByGoal(goalId));

    const rangeStart = goal.startDate
      ? new Date(goal.startDate)
      : tasks[0]
        ? new Date(tasks[0].date)
        : null;
    const rangeEnd = goal.endDate
      ? new Date(goal.endDate)
      : tasks[tasks.length - 1]
        ? new Date(tasks[tasks.length - 1].date)
        : null;

    if (
      !rangeStart ||
      !rangeEnd ||
      Number.isNaN(rangeStart.getTime()) ||
      Number.isNaN(rangeEnd.getTime())
    ) {
      return {
        goals: allGoals,
        goal,
        months: [],
        weeksByMonth: {},
        weeks: [],
        tasksByWeek: {},
        tasks
      };
    }

    const weeks = getCalendarWeeks(rangeStart, rangeEnd);
    const months = getMonthsBetweenDates(rangeStart, rangeEnd);

    const weeksByMonth = {};
    for (const week of weeks) {
      const start = new Date(week.startDate);
      const key = monthKey(start);
      if (!weeksByMonth[key]) {
        weeksByMonth[key] = [];
      }
      weeksByMonth[key].push({
        ...week,
        weekNumber: weeksByMonth[key].length + 1
      });
    }

    const tasksByWeek = groupTasksByWeek(tasks);

    return {
      goals: allGoals,
      goal,
      months,
      weeksByMonth,
      weeks,
      tasksByWeek,
      tasks
    };
  },

  async getAllHierarchy() {
    const goals = asArray(await goalApi.getGoals());
    const tasks = asArray(await taskApi.getAll());
    const tasksByWeek = groupTasksByWeek(tasks);

    const weeks = Object.keys(tasksByWeek)
      .sort()
      .map((key) => {
        const start = new Date(key);
        const end = endOfWeek(start);
        return {
          _id: key,
          startDate: start.toISOString(),
          endDate: end.toISOString()
        };
      });

    const monthMap = new Map();
    for (const goal of goals) {
      if (!goal.startDate || !goal.endDate) continue;
      const start = new Date(goal.startDate);
      const end = new Date(goal.endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;
      const months = getMonthsBetweenDates(start, end);
      for (const month of months) {
        monthMap.set(month._id, month);
      }
    }

    for (const week of weeks) {
      const key = monthKey(new Date(week.startDate));
      if (!monthMap.has(key)) {
        const d = new Date(week.startDate);
        monthMap.set(key, {
          _id: key,
          monthName: d.toLocaleString(undefined, { month: 'long', year: 'numeric' })
        });
      }
    }

    const months = Array.from(monthMap.values()).sort(sortByKey);

    return {
      goals,
      monthsByGoal: {},
      months,
      weeksByMonth: {},
      weeks,
      tasksByWeek,
      tasks,
      monthToGoal: {},
      weekToMonth: {}
    };
  }
};

export default api;

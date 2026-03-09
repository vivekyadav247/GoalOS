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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const isAuthEndpoint =
      typeof error?.config?.url === 'string' && error.config.url.startsWith('/auth/');

    if (status === 401 && !isAuthEndpoint) {
      clearAuthSession();
      if (hasWindow && !['/login', '/register'].includes(window.location.pathname)) {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
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

export const monthApi = {
  getByGoal: (goalId) => unwrap(api.get(`/months/${goalId}`)),
  create: (payload) => unwrap(api.post('/months', payload))
};

export const weekApi = {
  getByMonth: (monthId) => unwrap(api.get(`/weeks/${monthId}`)),
  create: (payload) => unwrap(api.post('/weeks', payload))
};

export const taskApi = {
  getByWeek: (weekId) => unwrap(api.get(`/tasks/${weekId}`)),
  create: (payload) => unwrap(api.post('/tasks', payload)),
  update: (id, payload) => unwrap(api.put(`/tasks/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/tasks/${id}`)),
  toggleComplete: (id, completed) => unwrap(api.put(`/tasks/${id}`, { completed }))
};

export const plannerApi = {
  async getGoalHierarchy(goalId) {
    const [goals, months] = await Promise.all([goalApi.getGoals(), monthApi.getByGoal(goalId)]);
    const allGoals = asArray(goals);
    const goal = allGoals.find((item) => item._id === goalId) || null;
    const monthList = asArray(months);

    const weekEntries = await Promise.all(
      monthList.map(async (month) => [month._id, asArray(await weekApi.getByMonth(month._id))])
    );

    const weeksByMonth = Object.fromEntries(weekEntries);
    const weeks = weekEntries.flatMap((entry) => entry[1]);

    const taskEntries = await Promise.all(
      weeks.map(async (week) => [week._id, asArray(await taskApi.getByWeek(week._id))])
    );

    const tasksByWeek = Object.fromEntries(taskEntries);
    const tasks = taskEntries.flatMap((entry) => entry[1]);

    return {
      goals: allGoals,
      goal,
      months: monthList,
      weeksByMonth,
      weeks,
      tasksByWeek,
      tasks
    };
  },

  async getAllHierarchy() {
    const goals = asArray(await goalApi.getGoals());

    const monthEntries = await Promise.all(
      goals.map(async (goal) => [goal._id, asArray(await monthApi.getByGoal(goal._id))])
    );
    const monthsByGoal = Object.fromEntries(monthEntries);
    const months = monthEntries.flatMap((entry) => entry[1]);

    const weekEntries = await Promise.all(
      months.map(async (month) => [month._id, asArray(await weekApi.getByMonth(month._id))])
    );
    const weeksByMonth = Object.fromEntries(weekEntries);
    const weeks = weekEntries.flatMap((entry) => entry[1]);

    const taskEntries = await Promise.all(
      weeks.map(async (week) => [week._id, asArray(await taskApi.getByWeek(week._id))])
    );
    const tasksByWeek = Object.fromEntries(taskEntries);
    const tasks = taskEntries.flatMap((entry) => entry[1]);

    const monthToGoal = {};
    for (const month of months) {
      monthToGoal[month._id] = month.goalId;
    }

    const weekToMonth = {};
    for (const week of weeks) {
      weekToMonth[week._id] = week.monthId;
    }

    return {
      goals,
      monthsByGoal,
      months,
      weeksByMonth,
      weeks,
      tasksByWeek,
      tasks,
      monthToGoal,
      weekToMonth
    };
  }
};

export default api;


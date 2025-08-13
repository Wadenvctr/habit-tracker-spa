import axios, { type AxiosInstance } from 'axios'

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api'

function authClient(token?: string | null): AxiosInstance {
    const instance = axios.create({ baseURL: API_BASE })
    // Если токен явно не передан, пробуем достать его из localStorage (его кладёт authSlice)
    const effectiveToken = token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)
    if (effectiveToken) instance.defaults.headers.common['Authorization'] = `Bearer ${effectiveToken}`
    return instance
}

export const api = {
    // Регистрация пользователя через бекэнд
    register: async (
        emailOrData: string | { email: string; password: string; name?: string },
        password?: string,
        name?: string
    ) => {
        let email: string
        if (typeof emailOrData === 'string') {
            email = emailOrData
        } else {
            email = emailOrData.email
            password = emailOrData.password
            name = emailOrData.name
        }
        if (!email || !password) throw new Error('Email и пароль обязательны')

        const { data } = await axios.post(`${API_BASE}/auth/register`, { email, password, name })
        // ожидается { token, user }
        return data as { token: string; user: User }
    },

    // Логин через бекэнд
    login: async (email: string, password: string) => {
        const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password })
        // ожидается { token, user }
        return data as { token: string; user: User }
    },

    // Получение пользователя по токену — в бекэнде нет отдельного эндпоинта, поэтому вернём null
    // (приложение может хранить user из ответа /login или /register)
    getUserByToken: (_token: string | null) => {
        return null
    },

    // Список привычек текущего пользователя (нужен токен)
    getHabits: async (_userId: string, token?: string) => {
        const { data } = await authClient(token).get('/habits')
        return data as Habit[]
    },

    // Создание привычки (нужен токен)
    createHabit: async (_userId: string, dataIn: { name: string; description?: string; goalDays: number; icon?: string }, token?: string) => {
        const { data } = await authClient(token).post('/habits', dataIn)
        return data as Habit
    },

    // Обновление привычки (нужен токен)
    updateHabit: async (habitId: string, dataIn: { name?: string; description?: string; goalDays?: number; icon?: string }, token?: string) => {
        const { data } = await authClient(token).put(`/habits/${habitId}`, dataIn)
        return data as Habit
    },

    // Удаление привычки (нужен токен)
    deleteHabit: async (habitId: string, token?: string) => {
        await authClient(token).delete(`/habits/${habitId}`)
        return true
    },

    // Получение дат выполнений по привычке (нужен токен)
    getCompletionsForHabit: async (habitId: string, token?: string) => {
        const { data } = await authClient(token).get(`/habits/${habitId}/completions`)
        return data as string[]
    },

    // Переключение выполнения на дату (нужен токен)
    toggleCompletion: async (habitId: string, dateISO: string, token?: string) => {
        const { data } = await authClient(token).post(`/habits/${habitId}/complete`, { date: dateISO })
        return data as { added?: boolean; removed?: boolean }
    },

    // Получение всех данных дашборда одним запросом (оптимизированный метод)
    getDashboardData: async (token?: string) => {
        const { data } = await authClient(token).get('/habits/dashboard/data')
        return data as { habits: Habit[]; completions: Record<string, string[]> }
    },
}

export interface Habit {
    createdAt: string;
    id: string;
    name: string;
    description?: string;
    goalDays: number;
    icon?: string;
    userId: string;
    pinnedAt?: string[];
}

export interface User {
    id: string;
    email: string;
    name?: string;
}
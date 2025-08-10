const LS_KEY = 'habit_tracker_db_v1'

type DB = {
    users: User[]
    auth: { [userId: string]: { password: string } }
    habits: Habit[]
    completions: { habitId: string; date: string }[]
}

function loadDB(): DB {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw) as DB
    const db: DB = { users: [], auth: {}, habits: [], completions: [] }
    localStorage.setItem(LS_KEY, JSON.stringify(db))
    return db
}

function saveDB(db: DB) {
    localStorage.setItem(LS_KEY, JSON.stringify(db))
}

function id(prefix = 'id') {
    return prefix + '_' + Math.random().toString(36).slice(2, 9)
}

export const api = {
    register: async (emailOrData: string | { email: string; password: string; name?: string }, password?: string, name?: string) => {
        const db = loadDB();
        let email: string;
        if (typeof emailOrData === 'string') {
            email = emailOrData;
        } else {
            email = emailOrData.email;
            password = emailOrData.password;
            name = emailOrData.name;
        }

        if (!email || !password) throw new Error('Email и пароль обязательны');

        if (db.users.find((u) => u.email === email)) throw new Error('Email уже используется');
        const idv = id('user');
        const user: User = { id: idv, email, name };
        db.users.push(user);
        db.auth[idv] = { password };
        saveDB(db);
        return { token: `fake-jwt-${idv}`, user };
    },
    login: async (email: string, password: string) => {
        const db = loadDB()
        const user = db.users.find((u) => u.email === email)
        if (!user) throw new Error('Invalid credentials')
        const entry = db.auth[user.id]
        if (!entry || entry.password !== password) throw new Error('Invalid credentials')
        return { token: `fake-jwt-${user.id}`, user }
    },
    getUserByToken: (token: string | null) => {
        if (!token) return null
        const parts = token.split('fake-jwt-')
        if (parts.length !== 2) return null
        const userId = parts[1]
        const db = loadDB()
        return db.users.find((u) => u.id === userId) ?? null
    },
    getHabits: async (userId: string) => {
        const db = loadDB()
        return db.habits.filter((h) => h.userId === userId)
    },
    createHabit: async (userId: string, data: { name: string; description?: string; goalDays: number; icon?: string }) => {
        const db = loadDB()
        const h: Habit = { id: id('habit'), userId, name: data.name, description: data.description, goalDays: data.goalDays, icon: data.icon, createdAt: new Date().toISOString() }
        db.habits.push(h)
        saveDB(db)
        return h
    },
    deleteHabit: async (habitId: string) => {
        const db = loadDB()
        db.habits = db.habits.filter((h) => h.id !== habitId)
        db.completions = db.completions.filter((c) => c.habitId !== habitId)
        saveDB(db)
        return true
    },
    getCompletionsForHabit: async (habitId: string) => {
        const db = loadDB()
        return db.completions.filter((c) => c.habitId === habitId).map((c) => c.date)
    },
    toggleCompletion: async (habitId: string, dateISO: string) => {
        const db = loadDB()
        const idx = db.completions.findIndex((c) => c.habitId === habitId && c.date === dateISO)
        if (idx >= 0) {
            db.completions.splice(idx, 1)
            saveDB(db)
            return { removed: true }
        }
        db.completions.push({ habitId, date: dateISO })
        saveDB(db)
        return { added: true }
    }
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
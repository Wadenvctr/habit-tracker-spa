import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


interface User {
    id: string;
    email: string;
    name?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
};

export const loadAuthFromStorage = createAsyncThunk(
    'auth/loadFromStorage',
    async () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            const user = JSON.parse(userStr);
            return { token, user };
        }
        return { token: null, user: null };
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loadAuthFromStorage.fulfilled, (state, action) => {
            if (action.payload.token && action.payload.user) {
                state.token = action.payload.token;
                state.user = action.payload.user;
            } else {
                state.token = null;
                state.user = null;
            }
        });
    }
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

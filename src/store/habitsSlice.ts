import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Habit } from '../api/api';

interface HabitsState {
    list: Habit[];
    completions: Record<string, string[]>;
}

const initialState: HabitsState = {
    list: [],
    completions: {},
};

const habitsSlice = createSlice({
    name: "habits",
    initialState,
    reducers: {
        setHabits: (state, action: PayloadAction<Habit[]>) => {
            state.list = action.payload;
        },
        addHabit: (state, action: PayloadAction<Habit>) => {
            state.list.push(action.payload);
        },
        updateHabit: (state, action: PayloadAction<Habit>) => {
            const index = state.list.findIndex((h) => h.id === action.payload.id);
            if (index !== -1) {
                state.list[index] = action.payload;
            }
        },
        removeHabit: (state, action: PayloadAction<string>) => {
            state.list = state.list.filter((h) => h.id !== action.payload);
            delete state.completions[action.payload];
        },
        updateHabitCompletions: (state, action: PayloadAction<Record<string, string[]>>) => {
            state.completions = action.payload;
        },
        toggleHabitCompletion: (state, action: PayloadAction<{ habitId: string; dateISO: string }>) => {
            const { habitId, dateISO } = action.payload;
            const dates = state.completions[habitId] ?? [];
            const idx = dates.indexOf(dateISO);

            if (idx >= 0) {
                dates.splice(idx, 1);
            } else {
                dates.push(dateISO);
            }
            state.completions[habitId] = dates;
        }
    }
});

export const { setHabits, addHabit, updateHabit, removeHabit, updateHabitCompletions, toggleHabitCompletion } = habitsSlice.actions;
export default habitsSlice.reducer;

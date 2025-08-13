import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import habitsReducer from "./habitsSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        habits: habitsReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;

import React, { useEffect, useState, useCallback } from "react";
import HabitCalendar from "../components/HabitCalendar";
import HabitTracker from "../components/HabitTracker";
import { Divider, ConfigProvider, message } from 'antd';
import ruRU from 'antd/lib/locale/ru_RU';
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { setHabits } from "../store/habitsSlice";
import { api } from "../api/api";

interface HabitsPageState {
  completionsData: Record<string, string[]>;
  loading: boolean;
}

function HabitsPage() {
  const dispatch = useDispatch();
  const habits = useSelector((state: RootState) => state.habits.list);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  
  const [state, setState] = useState<HabitsPageState>({
    completionsData: {},
    loading: false,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const dashboardData = await api.getDashboardData();
      dispatch(setHabits(dashboardData.habits));
      setState(prev => ({ ...prev, completionsData: dashboardData.completions }));
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      message.error('Не удалось загрузить данные');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId, fetchDashboardData]);

  const handleSetCompletionsData = useCallback((newData: React.SetStateAction<Record<string, string[]>>) => {
    setState(prev => ({
      ...prev,
      completionsData: typeof newData === 'function' ? newData(prev.completionsData) : newData
    }));
  }, []);

  return (
    <React.Fragment>
      <h2>Ваши привычки</h2>
      <p>*Рекомендованное время для развития привычки - 21 день</p>
      <HabitTracker 
        completionsData={state.completionsData}
        setCompletionsData={handleSetCompletionsData}
        onDataRefresh={fetchDashboardData}
        loading={state.loading}
      />
      <Divider className="mb-6"/>
      <ConfigProvider locale={{ ...ruRU, Calendar: { ...ruRU.Calendar, firstDayOfWeek: 1, } }}>
        <HabitCalendar habits={habits} completions={state.completionsData} />
      </ConfigProvider>
    </React.Fragment>
  );
}

export default HabitsPage;

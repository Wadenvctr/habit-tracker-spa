import React, { useEffect, useState } from "react";
import { Button, Input, List, Modal, message, Select, Space, Tag, InputNumber, Flex, Typography, Divider } from "antd";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { addHabit, removeHabit, setHabits, updateHabitCompletions } from "../store/habitsSlice";
import { api } from "../api/mockApi";
import dayjs from "dayjs";

const emojiOptions = [
  { label: "🔥", value: "🔥" },
  { label: "🌟", value: "🌟" },
  { label: "💪", value: "💪" },
  { label: "📚", value: "📚" },
  { label: "☕️", value: "☕️" },
  { label: "👌🏼", value: "👌🏼" },
  { label: "✍🏼", value: "✍🏼" },
];

function HabitTracker() {
  const dispatch = useDispatch();
  const habits = useSelector((state: RootState) => state.habits.list);
  const completions = useSelector((state: RootState) => state.habits.completions);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string | undefined>(undefined);
  const [goalDays, setGoalDays] = useState<number>(21);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [loadingCompletions, setLoadingCompletions] = useState(false);

  useEffect(() => {
    if (!userId) return;
    api.getHabits(userId)
      .then((data) => {
        dispatch(setHabits(data));
        loadCompletionsForHabits(data);
      })
      .catch(() => message.error("Ошибка загрузки привычек"));
  }, [userId, dispatch]);
  
// TODO: сделать отдельный ендпоинт, который одним запросом сразу парсил все данные по idUser, надо привести чтобы не стояли в очереди на запросы.
  const loadCompletionsForHabits = async (habitsData: typeof habits) => {
    setLoadingCompletions(true);
    try {
      const allCompletions: Record<string, string[]> = {};
      for (const habit of habitsData) {
        const dates = await api.getCompletionsForHabit(habit.id);
        allCompletions[habit.id] = dates;
      }
      dispatch(updateHabitCompletions(allCompletions));
    } catch {
      message.error("Ошибка загрузки отметок выполнения");
    } finally {
      setLoadingCompletions(false);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      message.warning("Введите название привычки");
      return;
    }
    if (goalDays < 1) {
      message.warning("Цель должна быть минимум 1 день");
      return;
    }
    if (!userId) {
      message.error("Пользователь не авторизован");
      return;
    }
    try {
      const newHabit = await api.createHabit(userId, {
        name: name.trim(),
        goalDays,
        icon,
      });
      dispatch(addHabit(newHabit));
      setName("");
      setIcon(undefined);
      setGoalDays(21);
      message.success("Привычка добавлена");
    } catch {
      message.error("Ошибка добавления привычки");
    }
  };

  const confirmDelete = (id: string) => {
    setIsDeleting(id);
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    try {
      await api.deleteHabit(isDeleting);
      dispatch(removeHabit(isDeleting));
      message.success("Привычка удалена");
    } catch {
      message.error("Ошибка удаления");
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleCompletionToday = async (habitId: string) => {
    if (!userId) {
      message.error("Пользователь не авторизован");
      return;
    }
    const todayISO = dayjs().format("YYYY-MM-DD");
    try {
      await api.toggleCompletion(habitId, todayISO);
      await loadCompletionsForHabits(habits);
      message.success("Отметка обновлена");
    } catch {
      message.error("Ошибка отметки выполнения");
    }
  };

  const isDoneToday = (habitId: string) => {
    const todayISO = dayjs().format("YYYY-MM-DD");
    return completions[habitId]?.includes(todayISO);
  };

  const getCurrentStreak = (habitId: string): number => {
    const dates = completions[habitId];
    if (!dates || dates.length === 0) return 0;

    const sortedDates = dates
      .map((d) => dayjs(d))
      .sort((a, b) => a.diff(b));

    let streak = 0;
    let currentDate = dayjs().startOf('day');

    for (let i = sortedDates.length - 1; i >= 0; i--) {
      if (sortedDates[i].isSame(currentDate, 'day')) {
        streak++;
        currentDate = currentDate.subtract(1, 'day');
      } else if (sortedDates[i].isBefore(currentDate, 'day')) {
        break;
      }
    }
    return streak;
  };

  return (
    <div>
      <Space style={{ marginBottom: 20 }}>
        <Input
          placeholder="Новая привычка"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: 200 }}
        />
        <InputNumber
          min={1}
          value={goalDays}
          onChange={(value) => setGoalDays(value ?? 21)}
          style={{ width: 120 }}
          placeholder="Цель дней"
        />
        <Select
          placeholder="Выберите иконку"
          options={emojiOptions}
          value={icon}
          onChange={setIcon}
          style={{ width: 120 }}
          allowClear
        />
        <Button type="primary" onClick={handleAdd}>
          Добавить
        </Button>
      </Space>
           
      <Flex vertical gap="middle" className="w-full">
      {habits.map((habit) => {
        const streak = getCurrentStreak(habit.id);
        const doneToday = isDoneToday(habit.id);

        return (
          <Flex key={habit.id} vertical className="w-full">
            <Flex
              wrap="wrap"
              align="center"
              justify="space-between"
              gap="small"
              className="w-full"
            >
              <Flex wrap="wrap" align="center" gap="small">
                {habit.icon && <span>{habit.icon}</span>}
                <Typography.Text strong>{habit.name}</Typography.Text>
                <Tag color={streak >= habit.goalDays ? "green" : "blue"}>
                  Прогресс: {streak} / {habit.goalDays} дней
                </Tag>
                {doneToday && <Tag color="success">Сегодня сделано</Tag>}
              </Flex>

              <Flex wrap="wrap" gap="small" style={{ flex: "1 1 auto", justifyContent: "flex-end" }}>
                <Button
                  danger
                  block
                  onClick={() => confirmDelete(habit.id)}
                  style={{ maxWidth: 200 }}
                >
                  Удалить
                </Button>
                <Button
                  block
                  type={doneToday ? "default" : "primary"}
                  onClick={() => toggleCompletionToday(habit.id)}
                  style={{ maxWidth: 200 }}
                >
                  {doneToday ? "Снять отметку" : "Сделано сегодня"}
                </Button>
              </Flex>
            </Flex>

            <Divider style={{ margin: "8px 0" }} />
          </Flex>
        );
      })}
    </Flex>
    
      <Modal
        title="Подтверждение удаления"
        open={Boolean(isDeleting)}
        onOk={handleDelete}
        onCancel={() => setIsDeleting(null)}
        okText="Удалить"
        cancelText="Отмена"
      >
        <p>Вы уверены, что хотите перестать прививать эту привычку?</p>
      </Modal>
    </div>
  );
}

export default HabitTracker;

import React, { useState, useCallback } from "react";
import { Button, Card, Modal, message, Select, Input, Tag, InputNumber, Flex, Typography, Divider, Form } from "antd";
import { Formik, type FormikProps } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { addHabit, removeHabit } from "../store/habitsSlice";
import { api } from "../api/api";
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

interface HabitFormValues {
  name: string;
  goalDays: number;
  icon?: string;
}

const habitValidationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Название должно содержать минимум 3 символа")
    .max(30, "Название должно содержать максимум 30 символов")
    .required("Название привычки обязательно"),
  goalDays: Yup.number()
    .min(1, "Цель должна быть минимум 1 день")
    .max(365, "Цель не может превышать 365 дней")
    .required("Цель в днях обязательна"),
  icon: Yup.string().optional(),
});

interface HabitTrackerProps {
  completionsData: Record<string, string[]>;
  setCompletionsData: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  onDataRefresh: () => Promise<void>;
  loading: boolean;
}

interface HabitTrackerState {
  isDeleting: string | null;
}

function HabitTracker({ completionsData, setCompletionsData, onDataRefresh, loading }: HabitTrackerProps) {
  const dispatch = useDispatch();
  const habits = useSelector((state: RootState) => state.habits.list);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const [state, setState] = useState<HabitTrackerState>({
    isDeleting: null,
  });

  const refreshCompletions = useCallback(async (habitId: string) => {
    try {
      const completions = await api.getCompletionsForHabit(habitId);
      setCompletionsData((prev: Record<string, string[]>) => ({ ...prev, [habitId]: completions }));
    } catch (error) {
      console.error(`Ошибка обновления выполнений для привычки ${habitId}:`, error);
    }
  }, [setCompletionsData]);

  const handleAddHabit = useCallback(async (values: HabitFormValues, { resetForm }: { resetForm: () => void }) => {
    if (!userId) {
      message.error("Пользователь не авторизован");
      return;
    }
    try {
      const newHabit = await api.createHabit(userId, {
        name: values.name.trim(),
        goalDays: values.goalDays,
        icon: values.icon,
      });
      dispatch(addHabit(newHabit));
      resetForm();
      message.success("Привычка добавлена");
    } catch (error) {
      console.error('Ошибка добавления привычки:', error);
      message.error("Ошибка добавления привычки");
    }
  }, [userId, dispatch]);



  const handleConfirmDelete = useCallback((id: string) => {
    setState(prev => ({ ...prev, isDeleting: id }));
  }, []);

  const handleDelete = useCallback(async () => {
    if (!state.isDeleting) return;
    try {
      await api.deleteHabit(state.isDeleting);
      dispatch(removeHabit(state.isDeleting));
      message.success("Привычка удалена");
    } catch (error) {
      console.error('Ошибка удаления привычки:', error);
      message.error("Ошибка удаления");
    } finally {
      setState(prev => ({ ...prev, isDeleting: null }));
    }
  }, [state.isDeleting, dispatch]);

  const handleToggleCompletionToday = useCallback(async (habitId: string) => {
    if (!userId) {
      message.error("Пользователь не авторизован");
      return;
    }
    const todayISO = dayjs().format("YYYY-MM-DD");
    try {
      await api.toggleCompletion(habitId, todayISO);
      await onDataRefresh();
      await refreshCompletions(habitId);
      message.success("Отметка обновлена");
    } catch (error) {
      console.error('Ошибка отметки выполнения:', error);
      message.error("Ошибка отметки выполнения");
    }
  }, [userId, onDataRefresh, refreshCompletions]);

  const isDoneToday = useCallback((habitId: string) => {
    const todayISO = dayjs().format("YYYY-MM-DD");
    return completionsData[habitId]?.includes(todayISO) || false;
  }, [completionsData]);

  const getCurrentStreak = useCallback((habitId: string): number => {
    const completions = completionsData[habitId] || [];
    if (completions.length === 0) return 0;

    const sortedDates = completions
      .map((date) => dayjs(date))
      .sort((a, b) => b.valueOf() - a.valueOf());

    let streak = 0;
    let currentDate = dayjs();

    for (const completionDate of sortedDates) {
      if (completionDate.isSame(currentDate, "day")) {
        streak++;
        currentDate = currentDate.subtract(1, "day");
      } else if (completionDate.isSame(currentDate.subtract(1, "day"), "day")) {
        streak++;
        currentDate = currentDate.subtract(1, "day");
      } else {
        break;
      }
    }

    return streak;
  }, [completionsData]);

  const initialValues: HabitFormValues = {
    name: "",
    goalDays: 21,
    icon: undefined,
  };

  return (
    <React.Fragment>
      <Card title="Добавить новую привычку" style={{ marginBottom: 20 }}>
        <Formik
          initialValues={initialValues}
          validationSchema={habitValidationSchema}
          onSubmit={handleAddHabit}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isSubmitting }: FormikProps<HabitFormValues>) => (
            <Form onFinish={handleSubmit} layout="vertical">
              <Form.Item
                label="Название привычки"
                validateStatus={errors.name && touched.name ? "error" : ""}
                help={errors.name && touched.name ? errors.name : ""}
              >
                <Input
                  name="name"
                  placeholder="Введите название привычки (3-30 символов)"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Form.Item>

              <Form.Item
                label="Цель в днях"
                validateStatus={errors.goalDays && touched.goalDays ? "error" : ""}
                help={errors.goalDays && touched.goalDays ? errors.goalDays : ""}
              >
                <InputNumber
                  name="goalDays"
                  min={1}
                  max={365}
                  value={values.goalDays}
                  onChange={(value: number | null) => setFieldValue("goalDays", value ?? 21)}
                  onBlur={handleBlur}
                  style={{ width: "100%" }}
                  placeholder="Количество дней для достижения цели"
                />
              </Form.Item>

              <Form.Item
                label="Иконка (необязательно)"
                help="Выберите эмодзи для визуального представления привычки"
              >
                <Select
                  placeholder="Выберите иконку"
                  options={emojiOptions}
                  value={values.icon}
                  onChange={(value: string) => setFieldValue("icon", value)}
                  allowClear
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting || loading}
                  block
                >
                  Добавить привычку
                </Button>
              </Form.Item>
            </Form>
          )}
        </Formik>
      </Card>
           
      <Flex vertical gap="middle" className="w-full">
        {habits.map((habit: any) => {
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
                  onClick={() => handleConfirmDelete(habit.id)}
                  style={{ maxWidth: 200 }}
                >
                  Удалить
                </Button>
                <Button
                  block
                  type={doneToday ? "default" : "primary"}
                  onClick={() => handleToggleCompletionToday(habit.id)}
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
        open={Boolean(state.isDeleting)}
        onOk={handleDelete}
        onCancel={() => setState(prev => ({ ...prev, isDeleting: null }))}
        okText="Удалить"
        cancelText="Отмена"
      >
        <p>Вы уверены, что хотите перестать прививать эту привычку?</p>
      </Modal>
    </React.Fragment>
  );
}

export default HabitTracker;

import { Calendar, Tooltip, Empty } from "antd";
import type { Dayjs } from "dayjs";
import type { CellRenderInfo } from "rc-picker/lib/interface";
import type { Habit } from "../api/api";

interface HabitCalendarProps {
  habits: Habit[];
  completions: Record<string, string[]>;
}

function HabitCalendar({ habits, completions }: HabitCalendarProps) {

  const cellRender = (date: Dayjs, info: CellRenderInfo<Dayjs>) => {
  if (info.type !== "date") {
    return info.originNode;
  }

  const dateStr = date.format("YYYY-MM-DD");
  const doneHabits = habits.filter(
    (habit) => completions[habit.id]?.includes(dateStr)
  );

  if (doneHabits.length === 0) return null;

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {doneHabits.map((habit) => (
        <Tooltip key={habit.id} title={habit.name}>
          <li style={{ display: "inline-block", marginRight: 4, fontSize: 18 }}>
            {habit.icon || "✔️"}
          </li>
        </Tooltip>
      ))}
    </ul>
  );
};

return (
  <div>
    <h2>Календарь выполнения привычек</h2>
    <Calendar fullscreen={false} cellRender={cellRender} mode="month" />
    {habits.length === 0 && <Empty description="Нет привычек для отображения" />}
  </div>
);
}
export default HabitCalendar;

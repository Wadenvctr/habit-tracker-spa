import HabitCalendar from "../components/HabitCalendar";
import HabitTracker from "../components/HabitTracker";
import { Divider, ConfigProvider } from 'antd'
import ruRU from 'antd/lib/locale/ru_RU'

function HabitsPage() {
  return (
    <div>
      <h2>Ваши привычки</h2>
      <p>*Рекомендованное время для развития привычки - 21 день</p>
      <HabitTracker />
       <Divider className="mb-6"/>
      <ConfigProvider locale={{ ...ruRU, Calendar: { ...ruRU.Calendar, firstDayOfWeek: 1, } }}>
        <HabitCalendar />
      </ConfigProvider>
    </div>
  );
}

export default HabitsPage;

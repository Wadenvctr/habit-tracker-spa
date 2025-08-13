import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HabitsPage from './pages/HabitsPage';
import PrivateRoute from './components/PrivateRoute';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store';
import { loadAuthFromStorage } from './store/authSlice';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(loadAuthFromStorage()).finally(() => setLoading(false));
  }, [dispatch]);

  if (loading) {
    return <div>Загрузка...</div>;
  }
  
  const router = createBrowserRouter([
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'login', element: <LoginPage /> },
        { path: 'register', element: <RegisterPage /> },
        {
          path: 'habits',
          element: (
            <PrivateRoute>
              <HabitsPage />
            </PrivateRoute>
          ),
        },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

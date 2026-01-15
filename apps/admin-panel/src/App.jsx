import { createBrowserRouter, RouterProvider, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import MobileBlocker from './components/MobileBlocker';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Competitions from './pages/Competitions';
import Athletes from './pages/Athletes';
import Sessions from './pages/Sessions';
import TechnicalPanel from './pages/TechnicalPanel';
import Layout from './components/Layout';

const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/',
      element: (
        <ProtectedRoute roles={['admin', 'technical']}>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Dashboard />,
        },
        {
          path: 'competitions',
          element: <Competitions />,
        },
        {
          path: 'athletes',
          element: <Athletes />,
        },
        {
          path: 'sessions',
          element: <Sessions />,
        },
        {
          path: 'technical',
          element: <TechnicalPanel />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  return (
    <AuthProvider>
      <MobileBlocker>
        <RouterProvider router={router}>
          <Toaster position="top-right" />
        </RouterProvider>
      </MobileBlocker>
    </AuthProvider>
  );
}

export default App;

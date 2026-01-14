import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Competitions from './pages/Competitions';
import Athletes from './pages/Athletes';
import Sessions from './pages/Sessions';
import TechnicalPanel from './pages/TechnicalPanel';
import Layout from './components/Layout';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="competitions" element={<Competitions />} />
          <Route path="athletes" element={<Athletes />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="technical" element={<TechnicalPanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

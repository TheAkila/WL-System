import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import LiveView from './pages/LiveView';
import Leaderboard from './pages/Leaderboard';
import MedalTable from './pages/MedalTable';
import SessionResults from './pages/SessionResults';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/live" replace />} />
          <Route path="live" element={<LiveView />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="medals" element={<MedalTable />} />
          <Route path="results" element={<SessionResults />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

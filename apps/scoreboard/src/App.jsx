import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header';
import CurrentAttempt from './components/CurrentAttempt';
import Rankings from './components/Rankings';
import SessionInfo from './components/SessionInfo';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [session, setSession] = useState(null);
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('attempt:created', (attempt) => {
      setCurrentAttempt(attempt);
    });

    newSocket.on('attempt:validated', (attempt) => {
      setCurrentAttempt(attempt);
      // Update rankings here
    });

    newSocket.on('session:updated', (updatedSession) => {
      setSession(updatedSession);
    });

    return () => newSocket.close();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        <SessionInfo session={session} />
        <CurrentAttempt attempt={currentAttempt} />
        <Rankings athletes={rankings} />
      </main>

      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Lifting Live Arena • Real-time Competition Tracking</p>
      </footer>
    </div>
  );
}

export default App;

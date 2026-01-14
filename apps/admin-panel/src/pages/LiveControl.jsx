import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import socketService from '../services/socket';

export default function LiveControl() {
  const { sessionId } = useParams();

  useEffect(() => {
    socketService.connect();
    socketService.joinSession(sessionId);

    return () => {
      socketService.leaveSession(sessionId);
      socketService.disconnect();
    };
  }, [sessionId]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Live Control - Session {sessionId}</h1>
      <div className="card">
        <p>Live control interface coming soon...</p>
      </div>
    </div>
  );
}

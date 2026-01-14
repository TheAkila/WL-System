import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import TopBar from './TopBar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
      {/* Top Bar */}
      <TopBar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

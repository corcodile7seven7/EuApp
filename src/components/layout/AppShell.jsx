import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-56 pb-20 md:pb-4 min-h-[calc(100vh-3.5rem)]">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

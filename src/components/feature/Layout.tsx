import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background-50 flex flex-col">
      <Navbar />
      <main className="flex-1 pb-14 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
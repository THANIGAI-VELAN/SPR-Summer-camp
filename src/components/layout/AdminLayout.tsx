import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { auth } from '../../lib/firebase';
import { Button } from '../ui/button';
import { LogOut, LayoutDashboard, Users, BookOpen, Trophy, Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const { profile } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => auth.signOut();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Assignments', path: '/admin/assignments', icon: BookOpen },
    { name: 'Leaderboard', path: '/admin/leaderboard', icon: Trophy },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      {/* Top Navbar - Glassmorphism */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/50 bg-zinc-950/60 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/60">
        <div className="flex h-16 items-center px-4 md:px-6 justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50">
              <Menu className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight text-primary">Admin Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400 hidden sm:inline-block">Welcome, {profile?.username}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Glassmorphism */}
        <aside className={`
          absolute top-0 left-0 z-50 h-full w-72 
          bg-zinc-900/70 backdrop-blur-2xl border-r border-zinc-800/50 
          flex flex-col transition-transform duration-300 ease-in-out shadow-2xl
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4 flex justify-between items-center border-b border-zinc-800/50">
            <span className="font-semibold text-zinc-200 ml-2">Menu</span>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-zinc-800/80 text-zinc-50 font-medium border border-zinc-700/50 shadow-lg' 
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-50 border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-zinc-800/50">
            <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50 transition-colors" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

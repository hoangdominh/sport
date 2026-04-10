import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Dumbbell, LayoutDashboard, Receipt, Users } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Tổng Quan', icon: LayoutDashboard },
  { to: '/expenses', label: 'Chi Tiêu', icon: Receipt },
  { to: '/members', label: 'Thành Viên', icon: Users },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <nav className="nav-glass sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-400 to-indigo-500 shadow-lg shadow-orange-500/25">
              <Dumbbell size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-white">SportTracker</span>
              <span className="text-[10px] text-white/40 -mt-0.5">Quản lý chi tiêu nhóm</span>
            </div>
          </NavLink>

          {/* Desktop tabs */}
          <div className="hidden items-center gap-1 rounded-full bg-white/5 p-1 sm:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || 
                (item.to !== '/' && location.pathname.startsWith(item.to));
              
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="border-t border-white/5 bg-[#0a0a0a]/95 px-4 py-4 backdrop-blur-xl sm:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || 
                  (item.to !== '/' && location.pathname.startsWith(item.to));
                
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500/20 to-indigo-500/20 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-orange-400' : ''} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
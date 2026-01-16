import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Сессии' },
  { to: '/new', label: 'Новая' },
  { to: '/roles', label: 'Роли' },
  { to: '/table', label: 'Стол' },
  { to: '/night', label: 'Ночь' },
  { to: '/day', label: 'День' },
  { to: '/log', label: 'Журнал' },
  { to: '/roles-db', label: 'База' },
  { to: '/settings', label: 'Правила' }
];

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:border-r lg:border-slate-800 lg:bg-slate-900/60">
        <div className="p-4 text-lg font-semibold">Мафия — Оборотни</div>
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 pb-20 lg:pb-0">
        <div className="mx-auto w-full max-w-5xl px-4 py-6">{children}</div>
      </main>
    </div>
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-slate-800 bg-slate-900/90 py-2 text-xs lg:hidden">
      {navItems.slice(0, 6).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex min-h-[44px] flex-1 items-center justify-center rounded px-1 font-medium ${
              isActive ? 'text-accent' : 'text-slate-300'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  </div>
);

export default Layout;

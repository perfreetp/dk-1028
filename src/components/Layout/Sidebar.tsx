import { LayoutDashboard, Calendar, MapPin, ClipboardList, Eye, FileCheck, BarChart3, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { icon: LayoutDashboard, label: '质量看板', path: '/' },
  { icon: Calendar, label: '巡检计划', path: '/plans' },
  { icon: MapPin, label: '点位列表', path: '/points' },
  { icon: ClipboardList, label: '抽检任务', path: '/tasks' },
  { icon: Eye, label: '问题复核', path: '/review' },
  { icon: FileCheck, label: '整改工单', path: '/workorders' },
  { icon: BarChart3, label: '评分报表', path: '/reports' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-primary-600 min-h-screen text-white flex flex-col">
      <div className="p-6 border-b border-primary-500">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          视频巡检平台
        </h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-md'
                      : 'text-primary-200 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-primary-500">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-primary-200 hover:bg-white/10 hover:text-white transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}
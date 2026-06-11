import { Bell, Settings, User } from 'lucide-react';
import { useStore } from '@/store';

export function Header() {
  const { currentUser } = useStore();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {document.title.replace('监控视频质量巡检平台 - ', '')}
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-800">{currentUser?.name}</p>
            <p className="text-gray-500">
              {currentUser?.role === 'admin' && '系统管理员'}
              {currentUser?.role === 'supervisor' && '安防主管'}
              {currentUser?.role === 'inspector' && '巡检员'}
              {currentUser?.role === 'reviewer' && '复核员'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
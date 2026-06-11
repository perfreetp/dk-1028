import { Camera, CheckCircle, AlertCircle, Clock, Eye, FileCheck } from 'lucide-react';
import { useStore } from '@/store';
import { BarChart, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const statCards = [
  { key: 'total_points', label: '摄像点位总数', icon: Camera, color: 'bg-blue-500' },
  { key: 'qualified_points', label: '合格点位', icon: CheckCircle, color: 'bg-green-500' },
  { key: 'issue_count', label: '待处理问题', icon: AlertCircle, color: 'bg-red-500' },
  { key: 'pass_rate', label: '合格率', icon: CheckCircle, color: 'bg-teal-500', isPercent: true },
  { key: 'pending_tasks', label: '待执行任务', icon: Clock, color: 'bg-yellow-500' },
  { key: 'pending_workorders', label: '待处理工单', icon: FileCheck, color: 'bg-purple-500' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Dashboard() {
  const { dashboardStats, monthlyStats, issues, areas, cameraPoints } = useStore();

  const issueTypeDistribution = [
    { name: '遮挡', value: issues.filter(i => i.type === 'occlusion').length },
    { name: '偏移', value: issues.filter(i => i.type === 'offset').length },
    { name: '模糊', value: issues.filter(i => i.type === 'blur').length },
    { name: '水印缺失', value: issues.filter(i => i.type === 'no_watermark').length },
    { name: '回放异常', value: issues.filter(i => i.type === 'no_playback').length },
    { name: '其他', value: issues.filter(i => i.type === 'other' || i.type === 'night_vision').length },
  ];

  const areaPointCount = areas
    .filter(a => !a.parent_id)
    .map(area => {
      const childAreaIds = areas.filter(sub => sub.parent_id === area.id).map(sub => sub.id);
      const count = cameraPoints.filter(p => 
        p.area_id === area.id || childAreaIds.includes(p.area_id)
      ).length;
      return {
        name: area.name,
        value: count,
      };
    });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(({ key, label, icon: Icon, color, isPercent }) => (
          <div
            key={key}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {isPercent ? `${dashboardStats[key as keyof typeof dashboardStats]}%` : dashboardStats[key as keyof typeof dashboardStats]}
                </p>
              </div>
              <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">月度合格率趋势</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pass_rate" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">问题类型分布</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={issueTypeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {issueTypeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">区域点位分布</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={areaPointCount}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">待复核问题</h3>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              查看全部 <Eye className="w-4 h-4 inline ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {issues.filter(i => !i.confirmed).slice(0, 5).map(issue => (
              <div key={issue.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${issue.severity === 'high' ? 'bg-red-500' : issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{issue.description}</p>
                  <p className="text-sm text-gray-500">
                    {issue.type === 'occlusion' && '遮挡'}
                    {issue.type === 'offset' && '偏移'}
                    {issue.type === 'blur' && '模糊'}
                    {issue.type === 'no_watermark' && '水印缺失'}
                    {issue.type === 'no_playback' && '回放异常'}
                    {issue.type === 'night_vision' && '夜视问题'}
                    {issue.type === 'other' && '其他'}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{issue.created_at}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
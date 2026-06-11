import { useState } from 'react';
import { Download, Trophy, TrendingUp, Calendar, Award, Medal, BarChart3, FileText } from 'lucide-react';
import { useStore } from '@/store';
import { BarChart, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Reports() {
  const { pointRankings, monthlyStats, cameraPoints, issues, areas } = useStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const topPoints = pointRankings.slice(0, 5);
  const bottomPoints = [...pointRankings].reverse().slice(0, 5);

  const issueTypeStats = [
    { name: '遮挡', value: issues.filter(i => i.type === 'occlusion').length },
    { name: '偏移', value: issues.filter(i => i.type === 'offset').length },
    { name: '模糊', value: issues.filter(i => i.type === 'blur').length },
    { name: '水印缺失', value: issues.filter(i => i.type === 'no_watermark').length },
    { name: '回放异常', value: issues.filter(i => i.type === 'no_playback').length },
    { name: '其他', value: issues.filter(i => i.type === 'other' || i.type === 'night_vision').length },
  ];

  const areaStats = areas
    .filter(a => !a.parent_id)
    .map(area => {
      const points = cameraPoints.filter(p => p.area_id === area.id || cameraPoints.some(p => p.area_id === area.id));
      const avgScore = points.length > 0 ? Math.round(points.reduce((sum, p) => sum + p.score, 0) / points.length) : 0;
      return { name: area.name, avgScore, count: points.length };
    });

  const handleExport = () => {
    alert('报表导出功能已触发');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">评分报表</h2>
          <p className="text-gray-500 mt-1">查看点位评分排行和月度合格率统计</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
              <Award className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">平均评分</p>
              <p className="text-3xl font-bold text-gray-800">
                {Math.round(cameraPoints.reduce((sum, p) => sum + p.score, 0) / cameraPoints.length)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">月度合格率</p>
              <p className="text-3xl font-bold text-green-600">
                {monthlyStats[monthlyStats.length - 1]?.pass_rate || 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">累计问题数</p>
              <p className="text-3xl font-bold text-red-600">{issues.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">点位评分排行</h3>
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="space-y-4">
            {topPoints.map((point, index) => (
              <div key={point.rank} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-orange-300 text-orange-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {point.rank}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{point.name}</p>
                  <p className="text-sm text-gray-500">{point.area_name} · 巡检 {point.inspection_count} 次</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${getScoreColor(point.score)}`}>{point.score}</p>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${point.score >= 90 ? 'bg-green-500' : point.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${point.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">月度合格率趋势</h3>
            <BarChart3 className="w-6 h-6 text-primary-600" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, '合格率']} />
              <Line type="monotone" dataKey="pass_rate" stroke="#3b82f6" strokeWidth={2} dot={{ r: 6 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">问题类型分布</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={issueTypeStats}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {issueTypeStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">区域评分对比</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={areaStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}分`, '平均分']} />
              <Bar dataKey="avgScore" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Medal className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-800">待关注点位</h3>
          </div>
          <div className="space-y-3">
            {bottomPoints.map((point) => (
              <div key={point.rank} className={`flex items-center gap-3 p-3 rounded-lg ${getScoreBgColor(point.score)}`}>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{point.name}</p>
                  <p className="text-sm text-gray-500">{point.area_name}</p>
                </div>
                <span className={`text-lg font-bold ${getScoreColor(point.score)}`}>{point.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">点位评分明细表</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">排名</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">点位名称</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">所属区域</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">评分</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">巡检次数</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pointRankings.map((point, index) => (
                <tr key={point.rank} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-300 text-orange-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {point.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">{point.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">{point.area_name}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-lg font-bold ${getScoreColor(point.score)}`}>{point.score}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-600">{point.inspection_count}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      point.score >= 90 ? 'bg-green-100 text-green-700' :
                      point.score >= 70 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {point.score >= 90 ? '优秀' : point.score >= 70 ? '合格' : '待整改'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
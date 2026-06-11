import { useState } from 'react';
import { Plus, Edit, Trash2, Search, X, MapPin, Camera, Wifi } from 'lucide-react';
import { useStore } from '@/store';
import type { CameraPoint } from '@/types';

export function CameraPoints() {
  const { cameraPoints, areas, addCameraPoint, updateCameraPoint, deleteCameraPoint, setNotification } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<CameraPoint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    area_id: '',
    location: '',
    type: '',
    ip_address: '',
    status: 'active' as 'active' | 'inactive' | 'maintenance',
  });

  const typeOptions = ['枪机', '半球', '球机', '枪球联动'];

  const filteredPoints = cameraPoints.filter(point => {
    const matchesSearch = point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         point.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         point.ip_address.includes(searchQuery);
    const matchesArea = !selectedArea || point.area_id === selectedArea || 
                       areas.find(a => a.id === point.area_id)?.parent_id === selectedArea;
    return matchesSearch && matchesArea;
  });

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedPoint(null);
    setFormData({
      name: '',
      area_id: '',
      location: '',
      type: '',
      ip_address: '',
      status: 'active',
    });
    setShowForm(true);
  };

  const handleOpenEdit = (point: CameraPoint) => {
    setIsEditing(true);
    setSelectedPoint(point);
    setFormData({
      name: point.name,
      area_id: point.area_id,
      location: point.location,
      type: point.type,
      ip_address: point.ip_address,
      status: point.status,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.area_id) {
      setNotification({ id: '1', type: 'error', message: '请填写必填字段', timestamp: new Date().toISOString() });
      return;
    }

    if (isEditing && selectedPoint) {
      updateCameraPoint(selectedPoint.id, formData);
      setNotification({ id: '1', type: 'success', message: '点位更新成功', timestamp: new Date().toISOString() });
    } else {
      addCameraPoint({
        ...formData,
        last_inspected_at: null,
        score: 0,
      });
      setNotification({ id: '1', type: 'success', message: '点位创建成功', timestamp: new Date().toISOString() });
    }
    setShowForm(false);
  };

  const handleDelete = (pointId: string) => {
    deleteCameraPoint(pointId);
    setNotification({ id: '1', type: 'success', message: '点位删除成功', timestamp: new Date().toISOString() });
  };

  const getAreaName = (areaId: string) => {
    return areas.find(a => a.id === areaId)?.name || areaId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '正常';
      case 'maintenance': return '维护中';
      default: return '停用';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const parentAreas = areas.filter(a => !a.parent_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">摄像点位</h2>
          <p className="text-gray-500 mt-1">管理所有摄像点位，查看点位状态和评分</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          添加点位
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索点位名称、位置或IP地址..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedArea}
            onChange={e => setSelectedArea(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">全部区域</option>
            {parentAreas.map(area => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPoints.map(point => (
          <div
            key={point.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{point.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(point.status)}`}>
                    {getStatusLabel(point.status)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleOpenEdit(point)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(point.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{point.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Wifi className="w-4 h-4" />
                <span>{point.ip_address}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-gray-500">类型: {point.type}</span>
                <span className="text-gray-500">区域: {getAreaName(point.area_id)}</span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">综合评分</span>
                  <span className={`text-xl font-bold ${getScoreColor(point.score)}`}>{point.score}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      point.score >= 90 ? 'bg-green-500' : point.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${point.score}%` }}
                  ></div>
                </div>
              </div>
              {point.last_inspected_at && (
                <div className="pt-2 text-xs text-gray-400">
                  上次巡检: {point.last_inspected_at}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">{isEditing ? '编辑点位' : '添加摄像点位'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">点位名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入点位名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所属区域 *</label>
                <select
                  value={formData.area_id}
                  onChange={e => setFormData({ ...formData, area_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">请选择区域</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.parent_id ? `├─ ${area.name}` : area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">安装位置</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入安装位置"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">摄像机类型</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">请选择类型</option>
                    {typeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP地址</label>
                  <input
                    type="text"
                    value={formData.ip_address}
                    onChange={e => setFormData({ ...formData, ip_address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="请输入IP地址"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'maintenance' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="active">正常</option>
                  <option value="maintenance">维护中</option>
                  <option value="inactive">停用</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {isEditing ? '保存修改' : '添加点位'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
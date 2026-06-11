import { useState } from 'react';
import { Plus, Edit, Trash2, Play, Eye, X, Calendar, MapPin, Users, ChevronDown } from 'lucide-react';
import { useStore } from '@/store';
import type { InspectionPlan, Area } from '@/types';

export function InspectionPlans() {
  const { inspectionPlans, areas, responsibleUnits, cameraPoints, addInspectionPlan, updateInspectionPlan, deleteInspectionPlan, generateTasks, setNotification } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InspectionPlan | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    area_id: '',
    cycle_type: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly',
    cycle_value: 1,
    responsible_unit_id: '',
    status: 'active' as 'active' | 'inactive',
  });

  const cycleOptions = [
    { value: 'daily', label: '每日' },
    { value: 'weekly', label: '每周' },
    { value: 'monthly', label: '每月' },
    { value: 'quarterly', label: '每季度' },
  ];

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedPlan(null);
    setFormData({
      name: '',
      area_id: '',
      cycle_type: 'monthly',
      cycle_value: 1,
      responsible_unit_id: '',
      status: 'active',
    });
    setShowForm(true);
  };

  const handleOpenEdit = (plan: InspectionPlan) => {
    setIsEditing(true);
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      area_id: plan.area_id,
      cycle_type: plan.cycle_type,
      cycle_value: plan.cycle_value,
      responsible_unit_id: plan.responsible_unit_id,
      status: plan.status,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.area_id || !formData.responsible_unit_id) {
      setNotification({ id: '1', type: 'error', message: '请填写必填字段', timestamp: new Date().toISOString() });
      return;
    }

    if (isEditing && selectedPlan) {
      updateInspectionPlan(selectedPlan.id, formData);
      setNotification({ id: '1', type: 'success', message: '计划更新成功', timestamp: new Date().toISOString() });
    } else {
      addInspectionPlan(formData);
      setNotification({ id: '1', type: 'success', message: '计划创建成功', timestamp: new Date().toISOString() });
    }
    setShowForm(false);
  };

  const handleDelete = (planId: string) => {
    deleteInspectionPlan(planId);
    setNotification({ id: '1', type: 'success', message: '计划删除成功', timestamp: new Date().toISOString() });
  };

  const handleOpenGenerate = (plan: InspectionPlan) => {
    setSelectedPlan(plan);
    const pointsInArea = cameraPoints.filter(p => {
      if (p.area_id === plan.area_id) return true;
      const area = areas.find(a => a.id === p.area_id);
      return area?.parent_id === plan.area_id;
    });
    setSelectedPoints(pointsInArea.map(p => p.id));
    setShowGenerateModal(true);
  };

  const handleGenerateTasks = () => {
    if (!selectedPlan || selectedPoints.length === 0) return;
    generateTasks(selectedPlan.id, selectedPoints);
    setShowGenerateModal(false);
    setNotification({ id: '1', type: 'success', message: '任务生成成功', timestamp: new Date().toISOString() });
  };

  const getAreaName = (areaId: string) => {
    return areas.find(a => a.id === areaId)?.name || areaId;
  };

  const getUnitName = (unitId: string) => {
    return responsibleUnits.find(u => u.id === unitId)?.name || unitId;
  };

  const getCycleLabel = (type: string, value: number) => {
    const label = cycleOptions.find(c => c.value === type)?.label || type;
    return value > 1 ? `${value}${label}` : label;
  };

  const getAreaPoints = (areaId: string) => {
    return cameraPoints.filter(p => {
      if (p.area_id === areaId) return true;
      const area = areas.find(a => a.id === p.area_id);
      return area?.parent_id === areaId;
    }).length;
  };

  const renderAreaTree = (areasList: Area[], parentId: string | null, level = 0) => {
    return areasList
      .filter(a => a.parent_id === parentId)
      .map(area => (
        <option key={area.id} value={area.id} style={{ paddingLeft: `${level * 16}px` }}>
          {area.name}
        </option>
      ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">巡检计划</h2>
          <p className="text-gray-500 mt-1">管理和创建巡检计划，设置巡检周期和责任单位</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          创建计划
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">计划名称</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">覆盖区域</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">巡检周期</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">责任单位</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">关联点位</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">状态</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inspectionPlans.map(plan => (
                <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">{plan.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {getAreaName(plan.area_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {getCycleLabel(plan.cycle_type, plan.cycle_value)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      {getUnitName(plan.responsible_unit_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">{getAreaPoints(plan.area_id)} 个</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {plan.status === 'active' ? '启用' : '停用'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleOpenEdit(plan)} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleOpenGenerate(plan)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(plan.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">{isEditing ? '编辑巡检计划' : '创建巡检计划'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">计划名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入计划名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">覆盖区域 *</label>
                <select
                  value={formData.area_id}
                  onChange={e => setFormData({ ...formData, area_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">请选择区域</option>
                  {renderAreaTree(areas, null)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">巡检周期</label>
                  <select
                    value={formData.cycle_type}
                    onChange={e => setFormData({ ...formData, cycle_type: e.target.value as 'daily' | 'weekly' | 'monthly' | 'quarterly' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {cycleOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">周期数量</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.cycle_value}
                    onChange={e => setFormData({ ...formData, cycle_value: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">责任单位 *</label>
                <select
                  value={formData.responsible_unit_id}
                  onChange={e => setFormData({ ...formData, responsible_unit_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">请选择责任单位</option>
                  {responsibleUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="active">启用</option>
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
                {isEditing ? '保存修改' : '创建计划'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showGenerateModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">生成抽检任务</h3>
              <button onClick={() => setShowGenerateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">选择点位（已选 {selectedPoints.length} 个）</span>
              <button
                onClick={() => setSelectedPoints(cameraPoints.filter(p => {
                  if (p.area_id === selectedPlan.area_id) return true;
                  const area = areas.find(a => a.id === p.area_id);
                  return area?.parent_id === selectedPlan.area_id;
                }).map(p => p.id))}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                全选
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {cameraPoints.filter(p => {
                  if (p.area_id === selectedPlan.area_id) return true;
                  const area = areas.find(a => a.id === p.area_id);
                  return area?.parent_id === selectedPlan.area_id;
                }).map(point => (
                  <label
                    key={point.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPoints.includes(point.id) ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPoints.includes(point.id)}
                      onChange={() => setSelectedPoints(prev =>
                        prev.includes(point.id)
                          ? prev.filter(id => id !== point.id)
                          : [...prev, point.id]
                      )}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{point.name}</p>
                      <p className="text-sm text-gray-500">{point.location}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      point.status === 'active' ? 'bg-green-100 text-green-700' :
                      point.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {point.status === 'active' ? '正常' : point.status === 'maintenance' ? '维护中' : '停用'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleGenerateTasks}
                disabled={selectedPoints.length === 0}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                生成任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
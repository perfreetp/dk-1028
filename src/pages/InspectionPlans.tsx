import { useState } from 'react';
import { Plus, Edit, Trash2, Play, Eye, X, Calendar, MapPin, Users, Settings, FileText, Check, Star } from 'lucide-react';
import { useStore } from '@/store';
import type { InspectionPlan, Area, InspectionTemplate } from '@/types';

export function InspectionPlans() {
  const { inspectionPlans, areas, responsibleUnits, cameraPoints, inspectionTemplates, addInspectionPlan, updateInspectionPlan, deleteInspectionPlan, generateTasks, setNotification, addInspectionTemplate, updateInspectionTemplate, deleteInspectionTemplate } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InspectionPlan | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InspectionTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    area_id: '',
    cycle_type: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly',
    cycle_value: 1,
    responsible_unit_id: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    clarity_weight: 50,
    night_effect_weight: 50,
    check_watermark: true,
    check_playback: true,
    check_clarity: true,
    check_night_effect: true,
    watermark_default_score: 100,
    playback_default_score: 100,
    clarity_default_score: 90,
    night_effect_default_score: 80,
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
    setSelectedTemplate('');
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
    const result = generateTasks(selectedPlan.id, selectedPoints, selectedTemplate || undefined);
    setShowGenerateModal(false);
    if (result) {
      if (result.success) {
        setNotification({ id: '1', type: 'success', message: `成功生成 ${result.count} 个任务`, timestamp: new Date().toISOString() });
      } else {
        setNotification({ id: '1', type: 'warning', message: result.message || '任务生成失败', timestamp: new Date().toISOString() });
      }
    }
  };

  const handleOpenTemplateModal = (template?: InspectionTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        description: template.description,
        clarity_weight: template.clarity_weight,
        night_effect_weight: template.night_effect_weight,
        check_watermark: template.check_watermark,
        check_playback: template.check_playback,
        check_clarity: template.check_clarity,
        check_night_effect: template.check_night_effect,
        watermark_default_score: template.watermark_default_score,
        playback_default_score: template.playback_default_score,
        clarity_default_score: template.clarity_default_score,
        night_effect_default_score: template.night_effect_default_score,
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        description: '',
        clarity_weight: 50,
        night_effect_weight: 50,
        check_watermark: true,
        check_playback: true,
        check_clarity: true,
        check_night_effect: true,
        watermark_default_score: 100,
        playback_default_score: 100,
        clarity_default_score: 90,
        night_effect_default_score: 80,
      });
    }
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name) {
      setNotification({ id: '1', type: 'error', message: '请填写模板名称', timestamp: new Date().toISOString() });
      return;
    }
    
    if (editingTemplate) {
      updateInspectionTemplate(editingTemplate.id, templateForm);
      setNotification({ id: '1', type: 'success', message: '模板更新成功', timestamp: new Date().toISOString() });
    } else {
      addInspectionTemplate(templateForm);
      setNotification({ id: '1', type: 'success', message: '模板创建成功', timestamp: new Date().toISOString() });
    }
    setShowTemplateModal(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    deleteInspectionTemplate(templateId);
    setNotification({ id: '1', type: 'success', message: '模板已删除', timestamp: new Date().toISOString() });
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenTemplateModal()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5" />
            模板维护
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            创建计划
          </button>
        </div>
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                选择巡检模板
              </label>
              <select
                value={selectedTemplate}
                onChange={e => setSelectedTemplate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">不使用模板</option>
                {inspectionTemplates.map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
              {selectedTemplate && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="text-gray-600">{inspectionTemplates.find(t => t.id === selectedTemplate)?.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {inspectionTemplates.find(t => t.id === selectedTemplate)?.check_clarity && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">清晰度</span>
                    )}
                    {inspectionTemplates.find(t => t.id === selectedTemplate)?.check_night_effect && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">夜视效果</span>
                    )}
                    {inspectionTemplates.find(t => t.id === selectedTemplate)?.check_watermark && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">时间水印</span>
                    )}
                    {inspectionTemplates.find(t => t.id === selectedTemplate)?.check_playback && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">录像回放</span>
                    )}
                  </div>
                </div>
              )}
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

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">模板维护</h3>
                <p className="text-sm text-gray-500 mt-1">创建和管理巡检模板</p>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">现有模板</h4>
                  <div className="space-y-3">
                    {inspectionTemplates.map(template => (
                      <div key={template.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary-600" />
                            <span className="font-medium text-gray-800">{template.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenTemplateModal(template)}
                              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.check_clarity && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">清晰度</span>}
                          {template.check_night_effect && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">夜视</span>}
                          {template.check_watermark && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">水印</span>}
                          {template.check_playback && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">回放</span>}
                        </div>
                      </div>
                    ))}
                    {inspectionTemplates.length === 0 && (
                      <p className="text-center text-gray-400 py-8">暂无模板，点击右侧创建</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">
                    {editingTemplate ? '编辑模板' : '创建模板'}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">模板名称 *</label>
                      <input
                        type="text"
                        value={templateForm.name}
                        onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="请输入模板名称"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">模板描述</label>
                      <textarea
                        value={templateForm.description}
                        onChange={e => setTemplateForm({ ...templateForm, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        rows={2}
                        placeholder="请输入模板描述"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">检查项</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <input
                            type="checkbox"
                            checked={templateForm.check_clarity}
                            onChange={e => setTemplateForm({ ...templateForm, check_clarity: e.target.checked })}
                            className="w-4 h-4 text-primary-600 rounded"
                          />
                          <Star className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">清晰度评分</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <input
                            type="checkbox"
                            checked={templateForm.check_night_effect}
                            onChange={e => setTemplateForm({ ...templateForm, check_night_effect: e.target.checked })}
                            className="w-4 h-4 text-primary-600 rounded"
                          />
                          <Star className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-700">夜视效果评分</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <input
                            type="checkbox"
                            checked={templateForm.check_watermark}
                            onChange={e => setTemplateForm({ ...templateForm, check_watermark: e.target.checked })}
                            className="w-4 h-4 text-primary-600 rounded"
                          />
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">时间水印检查</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <input
                            type="checkbox"
                            checked={templateForm.check_playback}
                            onChange={e => setTemplateForm({ ...templateForm, check_playback: e.target.checked })}
                            className="w-4 h-4 text-primary-600 rounded"
                          />
                          <Check className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-gray-700">录像回放抽查</span>
                        </label>
                      </div>
                    </div>

                    {templateForm.check_clarity && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">清晰度默认分值</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={templateForm.clarity_default_score}
                            onChange={e => setTemplateForm({ ...templateForm, clarity_default_score: parseInt(e.target.value) || 0 })}
                            className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <span className="text-sm text-gray-500">权重比例</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={templateForm.clarity_weight}
                            onChange={e => setTemplateForm({ ...templateForm, clarity_weight: parseInt(e.target.value) || 0 })}
                            className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                    )}

                    {templateForm.check_night_effect && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">夜视效果默认分值</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={templateForm.night_effect_default_score}
                            onChange={e => setTemplateForm({ ...templateForm, night_effect_default_score: parseInt(e.target.value) || 0 })}
                            className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <span className="text-sm text-gray-500">权重比例</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={templateForm.night_effect_weight}
                            onChange={e => setTemplateForm({ ...templateForm, night_effect_weight: parseInt(e.target.value) || 0 })}
                            className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveTemplate}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {editingTemplate ? '保存修改' : '创建模板'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useRef } from 'react';
import { Plus, Eye, CheckCircle, XCircle, Clock, AlertCircle, Upload, Users, Calendar, MapPin, X } from 'lucide-react';
import { useStore } from '@/store';
import type { WorkOrder } from '@/types';

export function WorkOrders() {
  const { workOrders, issues, responsibleUnits, cameraPoints, addWorkOrder, updateWorkOrder, reviewWorkOrder, setNotification } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    issue_id: '',
    responsible_unit_id: '',
    assignee_id: '',
    deadline: '',
    description: '',
  });

  const [completeData, setCompleteData] = useState({
    rectification_note: '',
    rectification_photos: [] as string[],
  });

  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCompleteData(prev => ({
          ...prev,
          rectification_photos: [...prev.rectification_photos, base64],
        }));
        setPhotoPreviewUrls(prev => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setCompleteData(prev => ({
      ...prev,
      rectification_photos: prev.rectification_photos.filter((_, i) => i !== index),
    }));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedOrder(null);
    setFormData({
      issue_id: '',
      responsible_unit_id: '',
      assignee_id: '',
      deadline: '',
      description: '',
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.issue_id || !formData.responsible_unit_id) {
      setNotification({ id: '1', type: 'error', message: '请填写必填字段', timestamp: new Date().toISOString() });
      return;
    }

    if (isEditing && selectedOrder) {
      updateWorkOrder(selectedOrder.id, formData);
      setNotification({ id: '1', type: 'success', message: '工单更新成功', timestamp: new Date().toISOString() });
    } else {
      addWorkOrder({
        ...formData,
        status: 'pending',
        rectification_photos: [],
        rectification_note: '',
        completed_at: null,
      });
      setNotification({ id: '1', type: 'success', message: '工单创建成功', timestamp: new Date().toISOString() });
    }
    setShowForm(false);
  };

  const handleOpenDetail = (order: WorkOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleOpenComplete = (order: WorkOrder) => {
    setSelectedOrder(order);
    setCompleteData({
      rectification_note: order.rectification_note,
      rectification_photos: order.rectification_photos,
    });
    setPhotoPreviewUrls(order.rectification_photos);
    setShowCompleteModal(true);
  };

  const handleComplete = () => {
    if (!selectedOrder) return;
    updateWorkOrder(selectedOrder.id, {
      ...completeData,
      status: 'completed',
      completed_at: new Date().toISOString().split('T')[0],
    });
    setShowCompleteModal(false);
    setNotification({ id: '1', type: 'success', message: '工单已完成', timestamp: new Date().toISOString() });
  };

  const handleReview = (orderId: string, approved: boolean) => {
    reviewWorkOrder(orderId, approved);
    setNotification({ id: '1', type: 'success', message: approved ? '工单已通过复核' : '工单已退回', timestamp: new Date().toISOString() });
    if (selectedOrder?.id === orderId) {
      setShowDetailModal(false);
    }
  };

  const getIssue = (issueId: string) => {
    return issues.find(i => i.id === issueId);
  };

  const getPointName = (pointId: string) => {
    return cameraPoints.find(p => p.id === pointId)?.name || pointId;
  };

  const getUnitName = (unitId: string) => {
    return responsibleUnits.find(u => u.id === unitId)?.name || unitId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'assigned': return 'bg-purple-100 text-purple-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return '已通过';
      case 'completed': return '待复核';
      case 'processing': return '处理中';
      case 'assigned': return '已分派';
      case 'rejected': return '已退回';
      default: return '待分派';
    }
  };

  const pendingOrders = workOrders.filter(w => w.status === 'pending');
  const processingOrders = workOrders.filter(w => ['assigned', 'processing'].includes(w.status));
  const completedOrders = workOrders.filter(w => w.status === 'completed');
  const reviewedOrders = workOrders.filter(w => ['approved', 'rejected'].includes(w.status));

  const isOverdue = (deadline: string, status: string) => {
    return new Date(deadline) < new Date() && status !== 'approved';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">整改工单</h2>
          <p className="text-gray-500 mt-1">创建和跟踪整改工单，分派责任单位并跟踪整改进度</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          创建工单
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待分派</p>
              <p className="text-2xl font-bold text-gray-800">{pendingOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">处理中</p>
              <p className="text-2xl font-bold text-yellow-600">{processingOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待复核</p>
              <p className="text-2xl font-bold text-blue-600">{completedOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已完成</p>
              <p className="text-2xl font-bold text-green-600">{reviewedOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">工单编号</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">关联问题</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">责任单位</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">截止日期</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">状态</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workOrders.map(order => {
                const issue = getIssue(order.issue_id);
                return (
                  <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${isOverdue(order.deadline, order.status) ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800">#{order.id.slice(-8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {issue ? issue.description : order.issue_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{getUnitName(order.responsible_unit_id)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className={isOverdue(order.deadline, order.status) ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {order.deadline}
                        </span>
                        {isOverdue(order.deadline, order.status) && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">超期</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenDetail(order)} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.status === 'assigned' && (
                          <button onClick={() => handleOpenComplete(order)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <>
                            <button onClick={() => handleReview(order.id, true)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleReview(order.id, false)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">{isEditing ? '编辑工单' : '创建整改工单'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联问题 *</label>
                <select
                  value={formData.issue_id}
                  onChange={e => setFormData({ ...formData, issue_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">请选择问题</option>
                  {issues.filter(i => i.status === 'confirmed').map(issue => (
                    <option key={issue.id} value={issue.id}>{issue.description}</option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">工单描述</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="请描述整改要求..."
                />
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
                {isEditing ? '保存修改' : '创建工单'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">工单详情</h3>
                  <p className="text-sm text-gray-500">#{selectedOrder.id.slice(-8)}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">状态</label>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">责任单位</label>
                  <span className="text-gray-800">{getUnitName(selectedOrder.responsible_unit_id)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">关联问题</label>
                {getIssue(selectedOrder.issue_id) ? (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-800">{getIssue(selectedOrder.issue_id)?.description}</p>
                    <p className="text-sm text-gray-500 mt-1">点位: {getPointName(getIssue(selectedOrder.issue_id)?.camera_point_id || '')}</p>
                  </div>
                ) : (
                  <p className="text-gray-400">问题已删除</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">工单描述</label>
                <p className="text-gray-800">{selectedOrder.description || '暂无描述'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">截止日期</label>
                  <span className={isOverdue(selectedOrder.deadline, selectedOrder.status) ? 'text-red-600' : 'text-gray-800'}>
                    {selectedOrder.deadline}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">创建时间</label>
                  <span className="text-gray-800">{selectedOrder.created_at}</span>
                </div>
              </div>

              {selectedOrder.completed_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">完成时间</label>
                  <span className="text-gray-800">{selectedOrder.completed_at}</span>
                </div>
              )}

              {selectedOrder.rectification_note && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">整改说明</label>
                  <p className="text-gray-800">{selectedOrder.rectification_note}</p>
                </div>
              )}

              {selectedOrder.rectification_photos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">整改照片</label>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedOrder.rectification_photos.map((url, index) => (
                      <div key={index} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <img src={url} alt={`整改照片 ${index + 1}`} className="max-w-full max-h-full object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              {selectedOrder.status === 'completed' && (
                <>
                  <button
                    onClick={() => handleReview(selectedOrder.id, false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    退回整改
                  </button>
                  <button
                    onClick={() => handleReview(selectedOrder.id, true)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    复核通过
                  </button>
                </>
              )}
              {selectedOrder.status !== 'completed' && (
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  关闭
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">完成整改</h3>
              <button onClick={() => setShowCompleteModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">整改说明</label>
                <textarea
                  value={completeData.rectification_note}
                  onChange={e => setCompleteData({ ...completeData, rectification_note: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="请描述整改措施和结果..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  整改照片
                </label>
                <input
                  ref={photoFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                {photoPreviewUrls.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {photoPreviewUrls.map((url, index) => (
                        <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img src={url} alt={`整改照片 ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => photoFileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      添加更多照片
                    </button>
                    <p className="text-xs text-gray-500">已上传 {photoPreviewUrls.length} 张照片</p>
                  </div>
                ) : (
                  <div
                    onClick={() => photoFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">点击或拖拽上传整改照片</p>
                    <p className="text-sm text-gray-400 mt-1">支持 JPG, PNG 格式</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                提交整改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Eye, X, Merge, Clock, Camera, Link } from 'lucide-react';
import { useStore } from '@/store';
import type { Issue } from '@/types';

export function IssueReview() {
  const { issues, cameraPoints, inspectionTasks, confirmIssue, updateIssue, mergeIssue, setNotification } = useStore();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeTarget, setMergeTarget] = useState('');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'other'>('pending');

  const handleOpenDetail = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowDetailModal(true);
  };

  const handleConfirm = (issueId: string) => {
    confirmIssue(issueId);
    setNotification({ id: '1', type: 'success', message: '问题已确认', timestamp: new Date().toISOString() });
    if (selectedIssue?.id === issueId) {
      setShowDetailModal(false);
    }
  };

  const handleMarkInvalid = (issueId: string) => {
    updateIssue(issueId, { status: 'invalid', confirmed: false });
    setNotification({ id: '1', type: 'success', message: '问题已标记为无效', timestamp: new Date().toISOString() });
    if (selectedIssue?.id === issueId) {
      setShowDetailModal(false);
    }
  };

  const handleOpenMerge = () => {
    setMergeTarget('');
    setShowMergeModal(true);
  };

  const handleMerge = () => {
    if (selectedIssues.length < 2 || !mergeTarget) {
      setNotification({ id: '1', type: 'error', message: '请选择至少2个问题并指定目标问题', timestamp: new Date().toISOString() });
      return;
    }

    selectedIssues.forEach(issueId => {
      if (issueId !== mergeTarget) {
        mergeIssue(issueId, mergeTarget);
      }
    });

    setShowMergeModal(false);
    setSelectedIssues([]);
    setNotification({ id: '1', type: 'success', message: '问题合并成功', timestamp: new Date().toISOString() });
  };

  const getPointName = (pointId: string) => {
    return cameraPoints.find(p => p.id === pointId)?.name || pointId;
  };

  const getTaskInfo = (taskId: string) => {
    return inspectionTasks.find(t => t.id === taskId);
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      occlusion: '遮挡',
      offset: '偏移',
      blur: '模糊',
      no_watermark: '时间水印缺失',
      no_playback: '录像回放异常',
      night_vision: '夜视效果差',
      other: '其他',
    };
    return types[type] || type;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return '严重';
      case 'high': return '高';
      case 'medium': return '中';
      default: return '低';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'invalid': return 'bg-gray-100 text-gray-600';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return '已确认';
      case 'pending': return '待复核';
      case 'invalid': return '无效';
      case 'resolved': return '已解决';
      default: return status;
    }
  };

  const pendingIssues = issues.filter(i => i.status === 'pending');
  const confirmedIssues = issues.filter(i => i.status === 'confirmed');
  const otherIssues = issues.filter(i => !['pending', 'confirmed'].includes(i.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">问题复核</h2>
          <p className="text-gray-500 mt-1">审核巡检发现的问题，确认问题真实性并处理重复问题</p>
        </div>
        {selectedIssues.length >= 2 && activeTab === 'pending' && (
          <button
            onClick={handleOpenMerge}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Merge className="w-5 h-5" />
            合并选中 ({selectedIssues.length})
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            <button
              onClick={() => {
                setActiveTab('pending');
                setSelectedIssues([]);
              }}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              待复核 ({pendingIssues.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('confirmed');
                setSelectedIssues([]);
              }}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'confirmed'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              已确认 ({confirmedIssues.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('other');
                setSelectedIssues([]);
              }}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'other'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              其他 ({otherIssues.length})
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {activeTab === 'pending' && pendingIssues.map(issue => (
            <IssueRow
              key={issue.id}
              issue={issue}
              selectedIssues={selectedIssues}
              setSelectedIssues={setSelectedIssues}
              handleOpenDetail={handleOpenDetail}
              handleConfirm={handleConfirm}
              handleMarkInvalid={handleMarkInvalid}
              getPointName={getPointName}
              getTypeLabel={getTypeLabel}
              getSeverityColor={getSeverityColor}
              getSeverityLabel={getSeverityLabel}
              showActions={true}
            />
          ))}
          {activeTab === 'confirmed' && confirmedIssues.map(issue => (
            <IssueRow
              key={issue.id}
              issue={issue}
              selectedIssues={selectedIssues}
              setSelectedIssues={setSelectedIssues}
              handleOpenDetail={handleOpenDetail}
              handleConfirm={handleConfirm}
              handleMarkInvalid={handleMarkInvalid}
              getPointName={getPointName}
              getTypeLabel={getTypeLabel}
              getSeverityColor={getSeverityColor}
              getSeverityLabel={getSeverityLabel}
              showActions={false}
            />
          ))}
          {activeTab === 'other' && otherIssues.map(issue => (
            <IssueRow
              key={issue.id}
              issue={issue}
              selectedIssues={selectedIssues}
              setSelectedIssues={setSelectedIssues}
              handleOpenDetail={handleOpenDetail}
              handleConfirm={handleConfirm}
              handleMarkInvalid={handleMarkInvalid}
              getPointName={getPointName}
              getTypeLabel={getTypeLabel}
              getSeverityColor={getSeverityColor}
              getSeverityLabel={getSeverityLabel}
              showActions={false}
            />
          ))}
          {activeTab === 'pending' && pendingIssues.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>暂无待复核的问题</p>
            </div>
          )}
          {activeTab === 'confirmed' && confirmedIssues.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>暂无已确认的问题</p>
            </div>
          )}
          {activeTab === 'other' && otherIssues.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>暂无其他问题</p>
            </div>
          )}
        </div>
      </div>

      {showDetailModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-800">问题详情</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">问题描述</label>
                <p className="text-gray-800">{selectedIssue.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">问题类型</label>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                    {getTypeLabel(selectedIssue.type)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">严重程度</label>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm ${getSeverityColor(selectedIssue.severity)}`}>
                    {getSeverityLabel(selectedIssue.severity)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">关联点位</label>
                  <span className="text-gray-800">{getPointName(selectedIssue.camera_point_id)}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">状态</label>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm ${getStatusColor(selectedIssue.status)}`}>
                    {getStatusLabel(selectedIssue.status)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">发现时间</label>
                <span className="text-gray-800">{selectedIssue.created_at}</span>
              </div>

              {getTaskInfo(selectedIssue.task_id) && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-2">关联任务</label>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-800">任务ID: {selectedIssue.task_id}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">问题图片</label>
                {selectedIssue.images_urls.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedIssue.images_urls.map((url, index) => (
                      <div key={index} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <img src={url} alt={`问题图片 ${index + 1}`} className="max-w-full max-h-full object-contain" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">暂无图片</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => handleMarkInvalid(selectedIssue.id)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                标记无效
              </button>
              <button
                onClick={() => handleConfirm(selectedIssue.id)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                确认问题
              </button>
            </div>
          </div>
        </div>
      )}

      {showMergeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Merge className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-800">合并问题</h3>
              </div>
              <button onClick={() => setShowMergeModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  已选择 {selectedIssues.length} 个问题进行合并
                </label>
                <div className="space-y-2">
                  {selectedIssues.map(issueId => {
                    const issue = issues.find(i => i.id === issueId);
                    return issue ? (
                      <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{issue.description}</span>
                        <input
                          type="radio"
                          name="mergeTarget"
                          checked={mergeTarget === issue.id}
                          onChange={() => setMergeTarget(issue.id)}
                        />
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Link className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    请选择一个目标问题，其他选中的问题将被合并到该问题下。合并后，被合并的问题将标记为已解决。
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMergeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleMerge}
                disabled={!mergeTarget}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认合并
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface IssueRowProps {
  issue: Issue;
  selectedIssues: string[];
  setSelectedIssues: React.Dispatch<React.SetStateAction<string[]>>;
  handleOpenDetail: (issue: Issue) => void;
  handleConfirm: (issueId: string) => void;
  handleMarkInvalid: (issueId: string) => void;
  getPointName: (pointId: string) => string;
  getTypeLabel: (type: string) => string;
  getSeverityColor: (severity: string) => string;
  getSeverityLabel: (severity: string) => string;
  showActions: boolean;
}

function IssueRow({
  issue,
  selectedIssues,
  setSelectedIssues,
  handleOpenDetail,
  handleConfirm,
  handleMarkInvalid,
  getPointName,
  getTypeLabel,
  getSeverityColor,
  getSeverityLabel,
  showActions
}: IssueRowProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        {showActions && (
          <input
            type="checkbox"
            checked={selectedIssues.includes(issue.id)}
            onChange={() => setSelectedIssues(prev =>
              prev.includes(issue.id) ? prev.filter(id => id !== issue.id) : [...prev, issue.id]
            )}
            className="mt-1 w-4 h-4 text-primary-600 rounded"
          />
        )}

        <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
          issue.severity === 'critical' ? 'bg-red-500' :
          issue.severity === 'high' ? 'bg-orange-500' :
          issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
        }`}></div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-800">{issue.description}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(issue.severity)}`}>
              {getSeverityLabel(issue.severity)}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Camera className="w-4 h-4" />
              {getPointName(issue.camera_point_id)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {issue.created_at}
            </span>
            <span>类型: {getTypeLabel(issue.type)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenDetail(issue)}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {showActions && (
            <>
              <button
                onClick={() => handleConfirm(issue.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                确认
              </button>
              <button
                onClick={() => handleMarkInvalid(issue.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                <XCircle className="w-4 h-4" />
                无效
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
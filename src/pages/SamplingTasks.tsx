import { useState, useRef } from 'react';
import { Play, CheckCircle, Clock, Camera, Star, Moon, Hash, X, Shuffle, Upload, Flag, AlertCircle, FileText } from 'lucide-react';
import { useStore } from '@/store';
import type { InspectionTask, InspectionTemplate } from '@/types';

export function SamplingTasks() {
  const { inspectionTasks, cameraPoints, areas, inspectionTemplates, issues, addInspectionTask, updateInspectionTask, addIssue, randomSample, setNotification } = useStore();
  const [selectedTask, setSelectedTask] = useState<InspectionTask | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [showRandomSampleModal, setShowRandomSampleModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [sampleCount, setSampleCount] = useState(3);
  const [sampledPoints, setSampledPoints] = useState<string[]>([]);

  const [taskForm, setTaskForm] = useState({
    clarity_score: 0,
    night_effect_score: 0,
    watermark_check: false,
    playback_check: false,
    screenshot_url: '',
  });

  const [issueForm, setIssueForm] = useState<{
    type: 'occlusion' | 'offset' | 'blur' | 'no_watermark' | 'no_playback' | 'night_vision' | 'other' | '';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    images_urls: string[];
  }>({
    type: '',
    description: '',
    severity: 'medium',
    images_urls: [],
  });

  const [showIssueForm, setShowIssueForm] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [issueImages, setIssueImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const issueFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUploadedImages(prev => [...prev, base64]);
        setScreenshotPreview(base64);
        setTaskForm({ ...taskForm, screenshot_url: base64 });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleIssueImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setIssueImages(prev => [...prev, base64]);
        setIssueForm(prev => ({ ...prev, images_urls: [...prev.images_urls, base64] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveIssueImage = (index: number) => {
    setIssueImages(prev => prev.filter((_, i) => i !== index));
    setIssueForm(prev => ({ ...prev, images_urls: prev.images_urls.filter((_, i) => i !== index) }));
  };

  const handleExecute = (task: InspectionTask) => {
    setSelectedTask(task);
    setUploadedImages(task.screenshot_url ? [task.screenshot_url] : []);
    setScreenshotPreview(task.screenshot_url || null);
    
    const template = task.template_id ? inspectionTemplates.find(t => t.id === task.template_id) : null;
    setSelectedTemplate(template || null);
    
    setTaskForm({
      clarity_score: task.clarity_score ?? (template?.check_clarity ? template.clarity_default_score : 0),
      night_effect_score: task.night_effect_score ?? (template?.check_night_effect ? template.night_effect_default_score : 0),
      watermark_check: task.watermark_check ?? (template?.check_watermark ? false : false),
      playback_check: task.playback_check ?? (template?.check_playback ? false : false),
      screenshot_url: task.screenshot_url || '',
    });
    setShowExecuteModal(true);
  };

  const handleCompleteTask = () => {
    if (!selectedTask) return;
    
    let avgScore = 0;
    if (selectedTemplate) {
      const clarityWeight = selectedTemplate.check_clarity ? selectedTemplate.clarity_weight : 0;
      const nightWeight = selectedTemplate.check_night_effect ? selectedTemplate.night_effect_weight : 0;
      const totalWeight = clarityWeight + nightWeight;
      if (totalWeight > 0) {
        avgScore = Math.round((taskForm.clarity_score * clarityWeight + taskForm.night_effect_score * nightWeight) / totalWeight);
      }
    } else {
      avgScore = Math.round((taskForm.clarity_score + taskForm.night_effect_score) / 2);
    }
    
    updateInspectionTask(selectedTask.id, {
      ...taskForm,
      status: 'completed' as const,
      completed_at: new Date().toISOString().split('T')[0],
    });
    
    const point = cameraPoints.find(p => p.id === selectedTask.camera_point_id);
    if (point) {
      const store = useStore.getState();
      store.updateCameraPoint(point.id, { score: avgScore, last_inspected_at: new Date().toISOString().split('T')[0] });
    }
    
    setShowExecuteModal(false);
    setNotification({ id: '1', type: 'success', message: '任务完成成功', timestamp: new Date().toISOString() });
  };

  const handleAddIssue = () => {
    if (!selectedTask || !issueForm.type || !issueForm.description) {
      setNotification({ id: '1', type: 'error', message: '请填写问题信息', timestamp: new Date().toISOString() });
      return;
    }

    addIssue({
      task_id: selectedTask.id,
      camera_point_id: selectedTask.camera_point_id,
      type: issueForm.type,
      description: issueForm.description,
      severity: issueForm.severity,
      status: 'pending',
      images_urls: issueForm.images_urls,
      confirmed: false,
      merged_into_id: null,
    });

    setIssueForm({ type: '', description: '', severity: 'medium', images_urls: [] });
    setIssueImages([]);
    setShowIssueForm(false);
    setNotification({ id: '1', type: 'success', message: '问题记录成功', timestamp: new Date().toISOString() });
  };

  const handleRandomSample = () => {
    if (!selectedArea) {
      setNotification({ id: '1', type: 'error', message: '请选择区域', timestamp: new Date().toISOString() });
      return;
    }
    
    const points = randomSample(selectedArea, sampleCount);
    setSampledPoints(points.map(p => p.id));
  };

  const handleGenerateTasksFromSample = () => {
    sampledPoints.forEach(pointId => {
      addInspectionTask({
        plan_id: 'manual',
        camera_point_id: pointId,
        assignee_id: '3',
        status: 'pending',
        scheduled_at: new Date().toISOString().split('T')[0],
        completed_at: null,
        screenshot_url: null,
        clarity_score: null,
        night_effect_score: null,
        watermark_check: false,
        playback_check: false,
      });
    });
    
    setShowRandomSampleModal(false);
    setNotification({ id: '1', type: 'success', message: '随机抽检任务生成成功', timestamp: new Date().toISOString() });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'in_progress': return '进行中';
      default: return '待执行';
    }
  };

  const getPointName = (pointId: string) => {
    return cameraPoints.find(p => p.id === pointId)?.name || pointId;
  };

  const getAreaName = (pointId: string) => {
    const point = cameraPoints.find(p => p.id === pointId);
    if (!point) return '';
    return areas.find(a => a.id === point.area_id)?.name || '';
  };

  const issueTypes = [
    { value: 'occlusion', label: '遮挡', icon: AlertCircle },
    { value: 'offset', label: '偏移', icon: AlertCircle },
    { value: 'blur', label: '模糊', icon: AlertCircle },
    { value: 'no_watermark', label: '时间水印缺失', icon: Hash },
    { value: 'no_playback', label: '录像回放异常', icon: Play },
    { value: 'night_vision', label: '夜视效果差', icon: Moon },
    { value: 'other', label: '其他', icon: Flag },
  ];

  const severityOptions = [
    { value: 'low', label: '低', color: 'bg-green-100 text-green-700' },
    { value: 'medium', label: '中', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'high', label: '高', color: 'bg-orange-100 text-orange-700' },
    { value: 'critical', label: '严重', color: 'bg-red-100 text-red-700' },
  ];

  const pendingTasks = inspectionTasks.filter(t => t.status === 'pending');
  const inProgressTasks = inspectionTasks.filter(t => t.status === 'in_progress');
  const completedTasks = inspectionTasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">抽检任务</h2>
          <p className="text-gray-500 mt-1">执行巡检任务，记录检查结果和问题</p>
        </div>
        <button
          onClick={() => setShowRandomSampleModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Shuffle className="w-5 h-5" />
          随机抽点
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">待执行</h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">{pendingTasks.length}</span>
          </div>
          <div className="p-4 space-y-3">
            {pendingTasks.map(task => (
              <div key={task.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{getPointName(task.camera_point_id)}</span>
                  <span className="text-xs text-gray-500">{getAreaName(task.camera_point_id)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Clock className="w-4 h-4" />
                  <span>{task.scheduled_at}</span>
                </div>
                <button
                  onClick={() => handleExecute(task)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  开始执行
                </button>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-center text-gray-400 py-8">暂无待执行任务</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">进行中</h3>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">{inProgressTasks.length}</span>
          </div>
          <div className="p-4 space-y-3">
            {inProgressTasks.map(task => (
              <div key={task.id} className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{getPointName(task.camera_point_id)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>执行中...</span>
                </div>
              </div>
            ))}
            {inProgressTasks.length === 0 && (
              <p className="text-center text-gray-400 py-8">暂无进行中的任务</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">已完成</h3>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">{completedTasks.length}</span>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {completedTasks.map(task => (
              <div key={task.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{getPointName(task.camera_point_id)}</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>清晰度: {task.clarity_score}</span>
                  <span>夜视: {task.night_effect_score}</span>
                </div>
                {task.screenshot_url && (
                  <div className="mt-2">
                    <img
                      src={task.screenshot_url}
                      alt="任务截图"
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setSelectedTask(task);
                        setScreenshotPreview(task.screenshot_url);
                        setTaskForm({
                          clarity_score: task.clarity_score || 0,
                          night_effect_score: task.night_effect_score || 0,
                          watermark_check: task.watermark_check,
                          playback_check: task.playback_check,
                          screenshot_url: task.screenshot_url || '',
                        });
                        setShowExecuteModal(true);
                      }}
                    />
                  </div>
                )}
                {task.completed_at && (
                  <div className="text-xs text-gray-400 mt-1">{task.completed_at}</div>
                )}
              </div>
            ))}
            {completedTasks.length === 0 && (
              <p className="text-center text-gray-400 py-8">暂无已完成任务</p>
            )}
          </div>
        </div>
      </div>

      {showExecuteModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">执行巡检任务</h3>
                <p className="text-gray-500 text-sm mt-1">{getPointName(selectedTask.camera_point_id)} - {getAreaName(selectedTask.camera_point_id)}</p>
              </div>
              <button onClick={() => setShowExecuteModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-gray-900 rounded-xl p-4 aspect-video flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Camera className="w-16 h-16 mx-auto mb-2" />
                  <p>视频预览区域</p>
                  <p className="text-sm">摄像机: {getPointName(selectedTask.camera_point_id)}</p>
                </div>
              </div>

              {selectedTemplate && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">当前模板: {selectedTemplate.name}</span>
                  </div>
                  <p className="text-sm text-blue-600">{selectedTemplate.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedTemplate.check_clarity && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">清晰度</span>}
                    {selectedTemplate.check_night_effect && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">夜视</span>}
                    {selectedTemplate.check_watermark && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">水印</span>}
                    {selectedTemplate.check_playback && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">回放</span>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(!selectedTemplate || selectedTemplate.check_clarity) && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Star className="w-4 h-4" />
                      清晰度评分
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={taskForm.clarity_score}
                        onChange={e => setTaskForm({ ...taskForm, clarity_score: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xl font-bold text-primary-600 w-12 text-right">{taskForm.clarity_score}</span>
                    </div>
                  </div>
                )}

                {(!selectedTemplate || selectedTemplate.check_night_effect) && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Moon className="w-4 h-4" />
                      夜视效果评分
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={taskForm.night_effect_score}
                        onChange={e => setTaskForm({ ...taskForm, night_effect_score: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xl font-bold text-primary-600 w-12 text-right">{taskForm.night_effect_score}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(!selectedTemplate || selectedTemplate.check_watermark) && (
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={taskForm.watermark_check}
                      onChange={e => setTaskForm({ ...taskForm, watermark_check: e.target.checked })}
                      className="w-5 h-5 text-primary-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-800">时间水印检查</p>
                      <p className="text-sm text-gray-500">确认视频画面包含时间水印</p>
                    </div>
                  </label>
                )}

                {(!selectedTemplate || selectedTemplate.check_playback) && (
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={taskForm.playback_check}
                      onChange={e => setTaskForm({ ...taskForm, playback_check: e.target.checked })}
                      className="w-5 h-5 text-primary-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-800">录像回放抽查</p>
                      <p className="text-sm text-gray-500">确认录像可以正常回放</p>
                    </div>
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  截图留证
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {screenshotPreview ? (
                  <div className="relative border-2 border-primary-300 rounded-lg p-2 bg-gray-50">
                    <img
                      src={screenshotPreview}
                      alt="截图预览"
                      className="w-full h-48 object-contain rounded"
                    />
                    <button
                      onClick={() => {
                        setScreenshotPreview(null);
                        setUploadedImages([]);
                        setTaskForm({ ...taskForm, screenshot_url: '' });
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-4 right-4 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      重新上传
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">点击或拖拽上传截图</p>
                    <p className="text-sm text-gray-400 mt-1">支持 JPG, PNG 格式</p>
                  </div>
                )}
                {uploadedImages.length > 0 && (
                  <p className="text-xs text-green-600 mt-2">已上传 {uploadedImages.length} 张截图</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">问题记录</h4>
                  <button
                    onClick={() => setShowIssueForm(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    添加问题
                  </button>
                </div>
                <div className="space-y-2">
                  {(() => {
                    const taskIssues = issues.filter(i => i.task_id === selectedTask?.id);
                    if (taskIssues.length > 0) {
                      return taskIssues.map(issue => (
                        <div key={issue.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-red-800">
                              {issue.type === 'occlusion' ? '遮挡' :
                               issue.type === 'offset' ? '偏移' :
                               issue.type === 'blur' ? '模糊' :
                               issue.type === 'no_watermark' ? '水印缺失' :
                               issue.type === 'no_playback' ? '回放异常' :
                               issue.type === 'night_vision' ? '夜视问题' : '其他'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              issue.severity === 'critical' ? 'bg-red-100 text-red-700' :
                              issue.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                              issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {issue.severity === 'critical' ? '严重' :
                               issue.severity === 'high' ? '高' :
                               issue.severity === 'medium' ? '中' : '低'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                          {issue.images_urls && issue.images_urls.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Camera className="w-3 h-3" />
                              <span>{issue.images_urls.length} 张图片</span>
                            </div>
                          )}
                        </div>
                      ));
                    }
                    return <p className="text-center text-gray-400 py-4">暂无问题记录</p>;
                  })()}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowExecuteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                暂存
              </button>
              <button
                onClick={handleCompleteTask}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                完成巡检
              </button>
            </div>
          </div>
        </div>
      )}

      {showIssueForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">记录问题</h3>
              <button onClick={() => setShowIssueForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">问题类型 *</label>
                <div className="grid grid-cols-2 gap-2">
                  {issueTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setIssueForm({ ...issueForm, type: type.value as 'occlusion' | 'offset' | 'blur' | 'no_watermark' | 'no_playback' | 'night_vision' | 'other' })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        issueForm.type === type.value
                          ? 'border-primary-500 bg-primary-50 text-primary-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">严重程度</label>
                <div className="flex gap-2">
                  {severityOptions.map(severity => (
                    <button
                      key={severity.value}
                      onClick={() => setIssueForm({ ...issueForm, severity: severity.value as 'low' | 'medium' | 'high' | 'critical' })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        issueForm.severity === severity.value
                          ? severity.color + ' ring-2 ring-offset-1 ring-gray-400'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {severity.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">问题描述 *</label>
                <textarea
                  value={issueForm.description}
                  onChange={e => setIssueForm({ ...issueForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="请描述问题详情..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Camera className="w-4 h-4 inline mr-1" />
                  问题图片
                </label>
                <input
                  ref={issueFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleIssueImageSelect}
                  className="hidden"
                />
                {issueImages.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2">
                      {issueImages.map((url, index) => (
                        <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img src={url} alt={`问题图片 ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemoveIssueImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => issueFileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      添加更多图片
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => issueFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-500">点击上传问题图片作为证据</p>
                    <p className="text-xs text-gray-400 mt-1">支持 JPG, PNG 格式</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowIssueForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddIssue}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                确认记录
              </button>
            </div>
          </div>
        </div>
      )}

      {showRandomSampleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">随机抽点</h3>
              <button onClick={() => setShowRandomSampleModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择区域 *</label>
                <select
                  value={selectedArea}
                  onChange={e => setSelectedArea(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">请选择区域</option>
                  {areas.filter(a => !a.parent_id).map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">抽取数量</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={sampleCount}
                  onChange={e => setSampleCount(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleRandomSample}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Shuffle className="w-5 h-5" />
                开始抽取
              </button>

              {sampledPoints.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">已抽取点位:</p>
                  <ul className="space-y-1">
                    {sampledPoints.map(pointId => (
                      <li key={pointId} className="text-sm text-gray-600">
                        • {getPointName(pointId)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRandomSampleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleGenerateTasksFromSample}
                disabled={sampledPoints.length === 0}
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
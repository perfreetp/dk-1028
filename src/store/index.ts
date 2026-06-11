import { create } from 'zustand';
import type {
  User,
  Area,
  CameraPoint,
  ResponsibleUnit,
  InspectionPlan,
  InspectionTask,
  Issue,
  WorkOrder,
  DashboardStats,
  MonthlyStat,
  PointRanking,
  Notification,
  InspectionTemplate,
} from '@/types';

const mockUsers: User[] = [
  { id: '1', email: 'admin@example.com', name: '系统管理员', role: 'admin', created_at: '2024-01-01' },
  { id: '2', email: 'supervisor@example.com', name: '安防主管', role: 'supervisor', created_at: '2024-01-01' },
  { id: '3', email: 'inspector@example.com', name: '巡检员张三', role: 'inspector', created_at: '2024-01-01' },
  { id: '4', email: 'reviewer@example.com', name: '复核员李四', role: 'reviewer', created_at: '2024-01-01' },
];

const mockInspectionTemplates: InspectionTemplate[] = [
  { id: 'tpl1', name: '标准巡检模板', description: '包含清晰度、夜视、水印、回放等全部检查项', clarity_weight: 50, night_effect_weight: 50, check_watermark: true, check_playback: true, check_clarity: true, check_night_effect: true, watermark_default_score: 100, playback_default_score: 100, clarity_default_score: 90, night_effect_default_score: 80, created_at: '2024-01-01' },
  { id: 'tpl2', name: '基础巡检模板', description: '仅检查清晰度和水印，适合日间监控点', clarity_weight: 70, night_effect_weight: 0, check_watermark: true, check_playback: false, check_clarity: true, check_night_effect: false, watermark_default_score: 100, playback_default_score: 0, clarity_default_score: 90, night_effect_default_score: 0, created_at: '2024-01-01' },
  { id: 'tpl3', name: '夜视专项模板', description: '重点检查夜视效果，适用于夜间重点区域', clarity_weight: 30, night_effect_weight: 70, check_watermark: true, check_playback: true, check_clarity: true, check_night_effect: true, watermark_default_score: 100, playback_default_score: 100, clarity_default_score: 80, night_effect_default_score: 90, created_at: '2024-01-01' },
];

const mockAreas: Area[] = [
  { id: 'a1', name: '总部大楼', parent_id: null, created_at: '2024-01-01' },
  { id: 'a2', name: '生产厂区', parent_id: null, created_at: '2024-01-01' },
  { id: 'a3', name: '仓储中心', parent_id: null, created_at: '2024-01-01' },
  { id: 'a1-1', name: '一楼大厅', parent_id: 'a1', created_at: '2024-01-01' },
  { id: 'a1-2', name: '二楼办公室', parent_id: 'a1', created_at: '2024-01-01' },
  { id: 'a1-3', name: '三楼会议室', parent_id: 'a1', created_at: '2024-01-01' },
  { id: 'a2-1', name: '车间A', parent_id: 'a2', created_at: '2024-01-01' },
  { id: 'a2-2', name: '车间B', parent_id: 'a2', created_at: '2024-01-01' },
];

const mockCameraPoints: CameraPoint[] = [
  { id: 'p1', name: '大厅入口', area_id: 'a1-1', location: '一楼大厅正门上方', type: '枪机', ip_address: '192.168.1.101', status: 'active', last_inspected_at: '2024-01-10', score: 95, created_at: '2024-01-01' },
  { id: 'p2', name: '电梯厅', area_id: 'a1-1', location: '一楼电梯厅', type: '半球', ip_address: '192.168.1.102', status: 'active', last_inspected_at: '2024-01-09', score: 88, created_at: '2024-01-01' },
  { id: 'p3', name: '财务室', area_id: 'a1-2', location: '二楼财务室门口', type: '枪机', ip_address: '192.168.1.103', status: 'active', last_inspected_at: '2024-01-08', score: 92, created_at: '2024-01-01' },
  { id: 'p4', name: '会议室A', area_id: 'a1-3', location: '三楼会议室A', type: '半球', ip_address: '192.168.1.104', status: 'active', last_inspected_at: '2024-01-07', score: 90, created_at: '2024-01-01' },
  { id: 'p5', name: '车间A入口', area_id: 'a2-1', location: '车间A正门', type: '枪机', ip_address: '192.168.1.201', status: 'active', last_inspected_at: '2024-01-06', score: 85, created_at: '2024-01-01' },
  { id: 'p6', name: '车间A内部', area_id: 'a2-1', location: '车间A内部中央', type: '球机', ip_address: '192.168.1.202', status: 'maintenance', last_inspected_at: '2024-01-05', score: 78, created_at: '2024-01-01' },
  { id: 'p7', name: '车间B入口', area_id: 'a2-2', location: '车间B正门', type: '枪机', ip_address: '192.168.1.203', status: 'active', last_inspected_at: '2024-01-04', score: 91, created_at: '2024-01-01' },
  { id: 'p8', name: '仓库大门', area_id: 'a3', location: '仓储中心大门', type: '枪机', ip_address: '192.168.1.301', status: 'active', last_inspected_at: '2024-01-03', score: 89, created_at: '2024-01-01' },
];

const mockResponsibleUnits: ResponsibleUnit[] = [
  { id: 'ru1', name: '安保部', contact_name: '王经理', contact_phone: '13800138001', created_at: '2024-01-01' },
  { id: 'ru2', name: '运维部', contact_name: '李主管', contact_phone: '13800138002', created_at: '2024-01-01' },
  { id: 'ru3', name: '工程部', contact_name: '张工', contact_phone: '13800138003', created_at: '2024-01-01' },
];

const mockInspectionPlans: InspectionPlan[] = [
  { id: 'plan1', name: '总部大楼月度巡检', area_id: 'a1', cycle_type: 'monthly', cycle_value: 1, responsible_unit_id: 'ru1', status: 'active', created_at: '2024-01-01' },
  { id: 'plan2', name: '生产厂区周巡检', area_id: 'a2', cycle_type: 'weekly', cycle_value: 1, responsible_unit_id: 'ru2', status: 'active', created_at: '2024-01-01' },
  { id: 'plan3', name: '仓储中心半月巡检', area_id: 'a3', cycle_type: 'monthly', cycle_value: 2, responsible_unit_id: 'ru1', status: 'inactive', created_at: '2024-01-01' },
];

const mockInspectionTasks: InspectionTask[] = [
  { id: 't1', plan_id: 'plan1', camera_point_id: 'p1', assignee_id: '3', status: 'completed', scheduled_at: '2024-01-10', completed_at: '2024-01-10', screenshot_url: '/screenshots/t1.png', clarity_score: 95, night_effect_score: 90, watermark_check: true, playback_check: true, created_at: '2024-01-09' },
  { id: 't2', plan_id: 'plan1', camera_point_id: 'p2', assignee_id: '3', status: 'completed', scheduled_at: '2024-01-09', completed_at: '2024-01-09', screenshot_url: '/screenshots/t2.png', clarity_score: 85, night_effect_score: 88, watermark_check: true, playback_check: true, created_at: '2024-01-08' },
  { id: 't3', plan_id: 'plan2', camera_point_id: 'p5', assignee_id: '3', status: 'in_progress', scheduled_at: '2024-01-11', completed_at: null, screenshot_url: null, clarity_score: null, night_effect_score: null, watermark_check: false, playback_check: false, created_at: '2024-01-10' },
  { id: 't4', plan_id: 'plan2', camera_point_id: 'p7', assignee_id: '3', status: 'pending', scheduled_at: '2024-01-12', completed_at: null, screenshot_url: null, clarity_score: null, night_effect_score: null, watermark_check: false, playback_check: false, created_at: '2024-01-10' },
];

const mockIssues: Issue[] = [
  { id: 'i1', task_id: 't2', camera_point_id: 'p2', type: 'blur', description: '画面轻微模糊，建议清洁镜头', severity: 'low', status: 'confirmed', images_urls: ['/issues/i1-1.png'], confirmed: true, merged_into_id: null, created_at: '2024-01-09' },
  { id: 'i2', task_id: 't3', camera_point_id: 'p5', type: 'occlusion', description: '镜头被杂物遮挡', severity: 'high', status: 'pending', images_urls: ['/issues/i2-1.png'], confirmed: false, merged_into_id: null, created_at: '2024-01-11' },
  { id: 'i3', task_id: 't3', camera_point_id: 'p5', type: 'no_watermark', description: '时间水印未显示', severity: 'medium', status: 'pending', images_urls: ['/issues/i3-1.png'], confirmed: false, merged_into_id: null, created_at: '2024-01-11' },
];

const mockWorkOrders: WorkOrder[] = [
  { id: 'wo1', issue_id: 'i1', responsible_unit_id: 'ru2', assignee_id: null, status: 'assigned', deadline: '2024-01-15', description: '清洁镜头并调整焦距', rectification_photos: [], rectification_note: '', completed_at: null, created_at: '2024-01-10' },
  { id: 'wo2', issue_id: 'i2', responsible_unit_id: 'ru1', assignee_id: '4', status: 'processing', deadline: '2024-01-14', description: '清除遮挡物', rectification_photos: [], rectification_note: '', completed_at: null, created_at: '2024-01-11' },
];

const mockMonthlyStats: MonthlyStat[] = [
  { month: '2024-07', pass_rate: 85, issue_count: 12, inspection_count: 156 },
  { month: '2024-08', pass_rate: 88, issue_count: 10, inspection_count: 162 },
  { month: '2024-09', pass_rate: 90, issue_count: 8, inspection_count: 158 },
  { month: '2024-10', pass_rate: 87, issue_count: 11, inspection_count: 165 },
  { month: '2024-11', pass_rate: 92, issue_count: 6, inspection_count: 170 },
  { month: '2024-12', pass_rate: 95, issue_count: 4, inspection_count: 168 },
];

const mockPointRankings: PointRanking[] = [
  { rank: 1, camera_point_id: 'p1', name: '大厅入口', area_name: '一楼大厅', score: 95, inspection_count: 12 },
  { rank: 2, camera_point_id: 'p3', name: '财务室', area_name: '二楼办公室', score: 92, inspection_count: 11 },
  { rank: 3, camera_point_id: 'p7', name: '车间B入口', area_name: '车间B', score: 91, inspection_count: 10 },
  { rank: 4, camera_point_id: 'p4', name: '会议室A', area_name: '三楼会议室', score: 90, inspection_count: 9 },
  { rank: 5, camera_point_id: 'p8', name: '仓库大门', area_name: '仓储中心', score: 89, inspection_count: 8 },
  { rank: 6, camera_point_id: 'p2', name: '电梯厅', area_name: '一楼大厅', score: 88, inspection_count: 12 },
  { rank: 7, camera_point_id: 'p5', name: '车间A入口', area_name: '车间A', score: 85, inspection_count: 10 },
  { rank: 8, camera_point_id: 'p6', name: '车间A内部', area_name: '车间A', score: 78, inspection_count: 7 },
];

interface AppState {
  currentUser: User | null;
  isLoading: boolean;
  notification: Notification | null;
  
  users: User[];
  areas: Area[];
  cameraPoints: CameraPoint[];
  responsibleUnits: ResponsibleUnit[];
  inspectionPlans: InspectionPlan[];
  inspectionTasks: InspectionTask[];
  inspectionTemplates: InspectionTemplate[];
  issues: Issue[];
  workOrders: WorkOrder[];
  
  dashboardStats: DashboardStats;
  monthlyStats: MonthlyStat[];
  pointRankings: PointRanking[];
  
  selectedArea: Area | null;
  selectedPoint: CameraPoint | null;
  selectedPlan: InspectionPlan | null;
  selectedTask: InspectionTask | null;
  selectedIssue: Issue | null;
  selectedWorkOrder: WorkOrder | null;
  
  setCurrentUser: (user: User | null) => void;
  setNotification: (notification: Notification | null) => void;
  
  addArea: (area: Omit<Area, 'id' | 'created_at'>) => void;
  updateArea: (id: string, updates: Partial<Area>) => void;
  deleteArea: (id: string) => void;
  
  addCameraPoint: (point: Omit<CameraPoint, 'id' | 'created_at'>) => void;
  updateCameraPoint: (id: string, updates: Partial<CameraPoint>) => void;
  deleteCameraPoint: (id: string) => void;
  
  addInspectionPlan: (plan: Omit<InspectionPlan, 'id' | 'created_at'>) => void;
  updateInspectionPlan: (id: string, updates: Partial<InspectionPlan>) => void;
  deleteInspectionPlan: (id: string) => void;
  
  addInspectionTask: (task: Omit<InspectionTask, 'id' | 'created_at'>) => void;
  updateInspectionTask: (id: string, updates: Partial<InspectionTask>) => void;
  
  addInspectionTemplate: (template: Omit<InspectionTemplate, 'id' | 'created_at'>) => void;
  updateInspectionTemplate: (id: string, updates: Partial<InspectionTemplate>) => void;
  deleteInspectionTemplate: (id: string) => void;
  
  addIssue: (issue: Omit<Issue, 'id' | 'created_at'>) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  confirmIssue: (id: string) => void;
  mergeIssue: (id: string, targetId: string) => void;
  
  addWorkOrder: (order: Omit<WorkOrder, 'id' | 'created_at'>) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  completeWorkOrder: (id: string) => void;
  reviewWorkOrder: (id: string, approved: boolean) => void;
  
  generateTasks: (planId: string, pointIds: string[], templateId?: string) => { success: boolean; message?: string; count?: number } | undefined;
  randomSample: (areaId: string, count: number) => CameraPoint[];
  
  setSelectedArea: (area: Area | null) => void;
  setSelectedPoint: (point: CameraPoint | null) => void;
  setSelectedPlan: (plan: InspectionPlan | null) => void;
  setSelectedTask: (task: InspectionTask | null) => void;
  setSelectedIssue: (issue: Issue | null) => void;
  setSelectedWorkOrder: (order: WorkOrder | null) => void;
  
  refreshDashboardStats: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: mockUsers[0],
  isLoading: false,
  notification: null,
  
  users: mockUsers,
  areas: mockAreas,
  cameraPoints: mockCameraPoints,
  responsibleUnits: mockResponsibleUnits,
  inspectionPlans: mockInspectionPlans,
  inspectionTasks: mockInspectionTasks,
  inspectionTemplates: mockInspectionTemplates,
  issues: mockIssues,
  workOrders: mockWorkOrders,
  
  dashboardStats: {
    total_points: mockCameraPoints.length,
    qualified_points: mockCameraPoints.filter(p => p.score >= 80).length,
    issue_count: mockIssues.length,
    pass_rate: Math.round((mockCameraPoints.filter(p => p.score >= 80).length / mockCameraPoints.length) * 100),
    pending_tasks: mockInspectionTasks.filter(t => t.status === 'pending').length,
    pending_reviews: mockIssues.filter(i => !i.confirmed).length,
    pending_workorders: mockWorkOrders.filter(w => w.status !== 'approved').length,
  },
  monthlyStats: mockMonthlyStats,
  pointRankings: mockPointRankings,
  
  selectedArea: null,
  selectedPoint: null,
  selectedPlan: null,
  selectedTask: null,
  selectedIssue: null,
  selectedWorkOrder: null,
  
  setCurrentUser: (user) => set({ currentUser: user }),
  setNotification: (notification) => set({ notification }),
  
  addArea: (area) => {
    const newArea: Area = {
      ...area,
      id: `a${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ areas: [...state.areas, newArea] }));
  },
  
  updateArea: (id, updates) => {
    set(state => ({
      areas: state.areas.map(a => a.id === id ? { ...a, ...updates } : a),
    }));
  },
  
  deleteArea: (id) => {
    set(state => ({
      areas: state.areas.filter(a => a.id !== id),
      cameraPoints: state.cameraPoints.filter(p => p.area_id !== id),
    }));
  },
  
  addCameraPoint: (point) => {
    const newPoint: CameraPoint = {
      ...point,
      id: `p${Date.now()}`,
      score: 0,
      created_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ cameraPoints: [...state.cameraPoints, newPoint] }));
    get().refreshDashboardStats();
  },
  
  updateCameraPoint: (id, updates) => {
    set(state => ({
      cameraPoints: state.cameraPoints.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
    get().refreshDashboardStats();
  },
  
  deleteCameraPoint: (id) => {
    set(state => ({ cameraPoints: state.cameraPoints.filter(p => p.id !== id) }));
    get().refreshDashboardStats();
  },
  
  addInspectionPlan: (plan) => {
    const newPlan: InspectionPlan = {
      ...plan,
      id: `plan${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ inspectionPlans: [...state.inspectionPlans, newPlan] }));
  },
  
  updateInspectionPlan: (id, updates) => {
    set(state => ({
      inspectionPlans: state.inspectionPlans.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  },
  
  deleteInspectionPlan: (id) => {
    set(state => ({
      inspectionPlans: state.inspectionPlans.filter(p => p.id !== id),
      inspectionTasks: state.inspectionTasks.filter(t => t.plan_id !== id),
    }));
  },
  
  addInspectionTask: (task) => {
    const newTask: InspectionTask = {
      ...task,
      id: `t${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ inspectionTasks: [...state.inspectionTasks, newTask] }));
  },
  
  updateInspectionTask: (id, updates) => {
    set(state => ({
      inspectionTasks: state.inspectionTasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
    get().refreshDashboardStats();
  },
  
  addInspectionTemplate: (template) => {
    const newTemplate: InspectionTemplate = {
      ...template,
      id: `tpl${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ inspectionTemplates: [...state.inspectionTemplates, newTemplate] }));
  },
  
  updateInspectionTemplate: (id, updates) => {
    set(state => ({
      inspectionTemplates: state.inspectionTemplates.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  },
  
  deleteInspectionTemplate: (id) => {
    set(state => ({ inspectionTemplates: state.inspectionTemplates.filter(t => t.id !== id) }));
  },
  
  addIssue: (issue) => {
    const newIssue: Issue = {
      ...issue,
      id: `i${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ issues: [...state.issues, newIssue] }));
    get().refreshDashboardStats();
  },
  
  updateIssue: (id, updates) => {
    set(state => ({
      issues: state.issues.map(i => i.id === id ? { ...i, ...updates } : i),
    }));
    get().refreshDashboardStats();
  },
  
  confirmIssue: (id) => {
    get().updateIssue(id, { confirmed: true, status: 'confirmed' });
  },
  
  mergeIssue: (id, targetId) => {
    set(state => ({
      issues: state.issues.map(i => i.id === id ? { ...i, merged_into_id: targetId, status: 'resolved' } : i),
    }));
  },
  
  addWorkOrder: (order) => {
    const newOrder: WorkOrder = {
      ...order,
      id: `wo${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ workOrders: [...state.workOrders, newOrder] }));
  },
  
  updateWorkOrder: (id, updates) => {
    set(state => ({
      workOrders: state.workOrders.map(w => w.id === id ? { ...w, ...updates } : w),
    }));
    get().refreshDashboardStats();
  },
  
  completeWorkOrder: (id) => {
    get().updateWorkOrder(id, { status: 'completed', completed_at: new Date().toISOString().split('T')[0] });
  },
  
  reviewWorkOrder: (id, approved) => {
    get().updateWorkOrder(id, { status: approved ? 'approved' : 'rejected' });
  },
  
  generateTasks: (planId, pointIds, templateId) => {
    const plan = get().inspectionPlans.find(p => p.id === planId);
    if (!plan) return;
    
    const existingTaskPointIds = get().inspectionTasks
      .filter(t => t.plan_id === planId && ['pending', 'in_progress'].includes(t.status))
      .map(t => t.camera_point_id);
    
    const newPointIds = pointIds.filter(id => !existingTaskPointIds.includes(id));
    
    if (newPointIds.length === 0) {
      return { success: false, message: '所选点位已存在待执行或进行中的任务' };
    }
    
    const tasks: Omit<InspectionTask, 'id' | 'created_at'>[] = newPointIds.map(pointId => ({
      plan_id: planId,
      template_id: templateId || null,
      camera_point_id: pointId,
      assignee_id: '3',
      status: 'pending',
      scheduled_at: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed_at: null,
      screenshot_url: null,
      clarity_score: null,
      night_effect_score: null,
      watermark_check: false,
      playback_check: false,
    }));
    
    tasks.forEach(task => get().addInspectionTask(task));
    return { success: true, count: tasks.length };
  },
  
  randomSample: (areaId, count) => {
    const state = get();
    const pointsInArea = state.cameraPoints.filter(p => {
      if (p.area_id === areaId) return true;
      const area = state.areas.find(a => a.id === p.area_id);
      return area?.parent_id === areaId;
    });
    
    const shuffled = [...pointsInArea].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  },
  
  setSelectedArea: (area) => set({ selectedArea: area }),
  setSelectedPoint: (point) => set({ selectedPoint: point }),
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setSelectedIssue: (issue) => set({ selectedIssue: issue }),
  setSelectedWorkOrder: (order) => set({ selectedWorkOrder: order }),
  
  refreshDashboardStats: () => {
    const state = get();
    const qualifiedCount = state.cameraPoints.filter(p => p.score >= 80).length;
    const passRate = Math.round((qualifiedCount / state.cameraPoints.length) * 100);
    
    set({
      dashboardStats: {
        total_points: state.cameraPoints.length,
        qualified_points: qualifiedCount,
        issue_count: state.issues.filter(i => i.status !== 'resolved' && i.status !== 'invalid').length,
        pass_rate: passRate,
        pending_tasks: state.inspectionTasks.filter(t => t.status === 'pending').length,
        pending_reviews: state.issues.filter(i => !i.confirmed).length,
        pending_workorders: state.workOrders.filter(w => w.status !== 'approved').length,
      },
    });
  },
}));

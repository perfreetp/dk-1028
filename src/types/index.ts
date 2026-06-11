export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'inspector' | 'reviewer';
  created_at: string;
}

export interface Area {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface CameraPoint {
  id: string;
  name: string;
  area_id: string;
  location: string;
  type: string;
  ip_address: string;
  status: 'active' | 'inactive' | 'maintenance';
  last_inspected_at: string | null;
  score: number;
  created_at: string;
}

export interface ResponsibleUnit {
  id: string;
  name: string;
  contact_name: string;
  contact_phone: string;
  created_at: string;
}

export interface InspectionPlan {
  id: string;
  name: string;
  area_id: string;
  cycle_type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  cycle_value: number;
  responsible_unit_id: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface InspectionTask {
  id: string;
  plan_id: string;
  camera_point_id: string;
  assignee_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  scheduled_at: string;
  completed_at: string | null;
  screenshot_url: string | null;
  clarity_score: number | null;
  night_effect_score: number | null;
  watermark_check: boolean;
  playback_check: boolean;
  created_at: string;
}

export interface Issue {
  id: string;
  task_id: string;
  camera_point_id: string;
  type: 'occlusion' | 'offset' | 'blur' | 'no_watermark' | 'no_playback' | 'night_vision' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'confirmed' | 'invalid' | 'resolved';
  images_urls: string[];
  confirmed: boolean;
  merged_into_id: string | null;
  created_at: string;
}

export interface WorkOrder {
  id: string;
  issue_id: string;
  responsible_unit_id: string;
  assignee_id: string | null;
  status: 'pending' | 'assigned' | 'processing' | 'completed' | 'reviewing' | 'approved' | 'rejected';
  deadline: string;
  description: string;
  rectification_photos: string[];
  rectification_note: string;
  completed_at: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_points: number;
  qualified_points: number;
  issue_count: number;
  pass_rate: number;
  pending_tasks: number;
  pending_reviews: number;
  pending_workorders: number;
}

export interface MonthlyStat {
  month: string;
  pass_rate: number;
  issue_count: number;
  inspection_count: number;
}

export interface PointRanking {
  rank: number;
  camera_point_id: string;
  name: string;
  area_name: string;
  score: number;
  inspection_count: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

export type UserRole = "admin" | "manager" | "technician" | "operator";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type EquipmentStatus = "online" | "offline" | "maintenance" | "fault";

export interface Facility {
  id: string;
  name: string;
  code: string;
  location: string;
  created_at: string;
}

export interface PlatformUser {
  id: string;
  facility_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Equipment {
  id: string;
  facility_id: string;
  name: string;
  equipment_type: string;
  serial_number: string;
  status: EquipmentStatus;
  created_at: string;
}

export interface Sensor {
  id: string;
  facility_id: string;
  equipment_id: string;
  sensor_type: "temperature" | "vibration" | "pressure";
  unit: string;
  created_at: string;
}

export interface SensorReading {
  id: string;
  facility_id: string;
  equipment_id: string;
  sensor_id: string;
  reading_value: number;
  recorded_at: string;
  created_at: string;
}

export interface Alert {
  id: string;
  facility_id: string;
  equipment_id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  is_resolved: boolean;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
  created_at: string;
}

export interface WorkOrder {
  id: string;
  facility_id: string;
  equipment_id: string;
  maintenance_schedule_id?: string | null;
  title: string;
  status: "open" | "assigned" | "in_progress" | "completed" | "cancelled";
  priority: AlertSeverity;
  due_date: string | null;
  assigned_to?: string | null;
  completed_at?: string | null;
  completion_notes?: string | null;
  created_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  facility_id: string;
  equipment_id: string;
  cadence_days: number;
  next_due_at: string;
  is_active: boolean;
  title: string | null;
  created_at: string;
}

export interface EquipmentHealthScore {
  id: string;
  facility_id: string;
  equipment_id: string;
  score: number;
  model_version: string;
  calculated_at: string;
  created_at: string;
}

export interface DowntimeEvent {
  id: string;
  facility_id: string;
  equipment_id: string;
  start_time: string;
  end_time: string | null;
  cause: string | null;
  created_at: string;
}

export interface DashboardSnapshot {
  equipmentCount: number;
  activeAlerts: number;
  avgHealthScore: number;
  uptimePercent: number;
  mtbfHours: number;
  mttrHours: number;
  equipmentByStatus: Array<{ status: EquipmentStatus; count: number }>;
  healthTrend: Array<{ label: string; score: number }>;
  recentWorkOrders: WorkOrder[];
}

export interface LiveMonitorSnapshot {
  readingsLastHour: number;
  latestTemperature: number | null;
  latestVibration: number | null;
  latestPressure: number | null;
  openCriticalAlerts: number;
}

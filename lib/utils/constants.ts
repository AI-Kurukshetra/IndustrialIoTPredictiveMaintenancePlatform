export const SENSOR_THRESHOLDS = {
  temperature: { warning: 80, critical: 95 },
  vibration: { warning: 12, critical: 18 },
  pressure: { warning: 140, critical: 170 }
} as const;

export const HEALTH_SCORE_ALERT_THRESHOLD = 60;
export const ROLLING_WINDOW_SIZE = 20;

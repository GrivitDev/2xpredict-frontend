'use client';

/**
 * Compatibility entry point for the retired pre-v2 Sports monitor panel.
 * The backend now exposes a consolidated operational snapshot; route this
 * legacy import to the current monitor rather than keeping a stale response
 * contract alive in the frontend.
 */
import SystemMonitorSportsV2 from './system-monitor-sports-v2';

export default function LegacySportsMonitorPanel() {
  return <SystemMonitorSportsV2 />;
}

/**
 * Aggregate raw heartrate stream data into time-at-heartrate format
 * @param heartrateData - Array of heartrate values (bpm)
 * @param timeData - Array of time values (seconds from start)
 * @returns Object mapping heartrate (bpm) to duration (seconds)
 */
function aggregateHeartRateData(
  heartrateData: number[],
  timeData: number[],
): Record<string, number> {
  const aggregated: Record<string, number> = {};

  for (let i = 0; i < heartrateData.length; i++) {
    const hr = heartrateData[i];
    const currentTime = timeData[i];
    const nextTime = timeData[i + 1] || currentTime;
    const duration = nextTime - currentTime;

    const hrKey = hr.toString();
    aggregated[hrKey] = (aggregated[hrKey] || 0) + duration;
  }

  return aggregated;
}

export const API_RATE = 10; // 10Hz
export const MAX_IDS_PER_CALL = 100;
export const MAX_DRY_STREAK = 10_000;

export const ACCOMMODATED_ID_COUNT = 500_000_000; // 500M ids

const PERFORMANCE_RUN_TIME = (5 * 60 + 30) * 60;
export const IDS_PER_CHUNK = PERFORMANCE_RUN_TIME * API_RATE;
export const CHUNK_COUNT = Math.ceil(ACCOMMODATED_ID_COUNT / IDS_PER_CHUNK);

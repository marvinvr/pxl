export const config = {
  dataDir: process.env.PXL_DATA_DIR || "./data",
  mgmtPort: parseInt(process.env.PXL_MGMT_PORT || "3000", 10),
  trackerPort: parseInt(process.env.PXL_TRACKER_PORT || "3001", 10),
  baseUrl: process.env.PXL_BASE_URL || "http://localhost:3001",
} as const;

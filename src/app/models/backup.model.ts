export interface BackupFile {
  filename: string;
  size_mb: number;
  created_at: string; // O Date si prefieres convertirlo
  download_url: string;
}

export interface BackupListResponse {
  backups: BackupFile[];
}
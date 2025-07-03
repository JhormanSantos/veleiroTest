export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: number;
  name: string;
  storage_key: string;
  mime_type: string;
  size_bytes: number;
  folder_id: number | null;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  pulse_language?: string;
  pulse_line_count?: number;
  pulse_named_entities?: any;
  pulse_raw_metadata?: any;
  created_at: string;
  updated_at: string;
}
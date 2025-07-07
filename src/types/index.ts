export interface RawMetadata {
  is_url: boolean;
  markdown: string;
}


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
  pulse_language?: string | null;
  pulse_line_count?: number | null;
  pulse_named_entities?: string | null;
  pulse_raw_metadata?: RawMetadata | null;
  created_at: string;
  updated_at: string;
}

export interface PulseApiResponse {
  markdown?: string;
  'plan-info'?: object;
  
}
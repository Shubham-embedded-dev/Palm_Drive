export type NeedId =
  | 'water'
  | 'food'
  | 'washroom'
  | 'medicine'
  | 'medical_help'
  | 'help_me'
  | 'change_position'
  | 'call_caregiver'
  | 'quick_yes'
  | 'quick_no';

export interface PatientNeed {
  id: NeedId;
  label: string;
  spokenPhrase: string;
  iconName: string;
  category: 'daily' | 'urgent' | 'comfort' | 'quick';
  description: string;
}

export type RequestState =
  | 'idle'
  | 'pending_confirmation'
  | 'sending'
  | 'confirmed'
  | 'cancelled'
  | 'failed';

export interface RequestRecord {
  id: string;
  needId: NeedId;
  label: string;
  phrase: string;
  timestamp: string;
  state: RequestState;
  blynkStatus?: {
    success: boolean;
    httpStatus?: number;
    message: string;
    note?: string;
  };
}

export interface AccessibilitySettings {
  voiceFeedback: boolean;
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  dwellSelection: boolean;
  dwellTimeSeconds: number;
  voicePitch: number;
  voiceRate: number;
  voiceName: string;
  audioChime: boolean;
}

export interface BlynkConfig {
  authToken: string;
  serverUrl: string;
  virtualPin: string;
  templateId?: string;
}

export interface HealthcareResource {
  title: string;
  url: string;
  source: string;
  snippet: string;
}

import { PatientNeed } from '../types';

export const PATIENT_NEEDS: PatientNeed[] = [
  { id: 'water', label: 'Water', spokenPhrase: 'I need water.', iconName: 'Droplets', category: 'daily', description: 'Request drinking water.' },
  { id: 'food', label: 'Food', spokenPhrase: 'I need food.', iconName: 'Utensils', category: 'daily', description: 'Request food or meal.' },
  { id: 'washroom', label: 'Washroom', spokenPhrase: 'I need washroom.', iconName: 'Bath', category: 'daily', description: 'Request restroom or hygiene.' },
  { id: 'medicine', label: 'Medicine', spokenPhrase: 'I need medicine.', iconName: 'Pill', category: 'daily', description: 'Request medication.' },
  { id: 'medical_help', label: 'Medical Help', spokenPhrase: 'Medical help.', iconName: 'Stethoscope', category: 'urgent', description: 'Urgent doctor or nurse attention.' },
  { id: 'help_me', label: 'SOS', spokenPhrase: 'SOS. Help me.', iconName: 'SOS', category: 'urgent', description: 'Immediate emergency alert.' },
  { id: 'change_position', label: 'Change Position', spokenPhrase: 'Change position.', iconName: 'RefreshCw', category: 'comfort', description: 'Request posture adjustment.' },
  { id: 'call_caregiver', label: 'Call Caregiver', spokenPhrase: 'Call caregiver.', iconName: 'BellRing', category: 'urgent', description: 'Direct caregiver call.' }
];

export const CONFIRMATION_PROMPT = 'Is this what you need?';
export const CONFIRMED_PHRASE = 'Request sent.';
export const CANCELLED_PHRASE = 'Cancelled.';

export const QUICK_RESPONSES: PatientNeed[] = [
  { id: 'quick_yes', label: 'YES', spokenPhrase: 'Yes.', iconName: 'Check', category: 'quick', description: 'Affirmative' },
  { id: 'quick_no', label: 'NO', spokenPhrase: 'No.', iconName: 'X', category: 'quick', description: 'Negative' }
];

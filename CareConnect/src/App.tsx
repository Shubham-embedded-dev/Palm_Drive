/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { PatientBoard } from './components/PatientBoard';
import { ActiveAlertBanner } from './components/ActiveAlertBanner';
import { AccessibilityBar } from './components/AccessibilityBar';
import { CaregiverModal } from './components/CaregiverModal';
import { PATIENT_NEEDS } from './constants/patientNeeds';
import { PatientNeed, RequestState, RequestRecord, AccessibilitySettings, BlynkConfig } from './types';
import { speechService } from './services/speechService';
import { getStoredBlynkConfig, saveStoredBlynkConfig, sendBlynkNotification, checkBlynkStatus } from './services/blynkService';
import { serialService } from './services/serialService';

const STORAGE_KEY_ACCESSIBILITY = 'careconnect_accessibility_settings';

const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  voiceFeedback: true, largeText: false, highContrast: false, reducedMotion: false,
  dwellSelection: false, dwellTimeSeconds: 1.8, voicePitch: 1.02, voiceRate: 0.92,
  voiceName: '', audioChime: true,
};

export default function App() {
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACCESSIBILITY);
      if (raw) return { ...DEFAULT_ACCESSIBILITY, ...JSON.parse(raw) };
    } catch {}
    return DEFAULT_ACCESSIBILITY;
  });
  const [blynkConfig, setBlynkConfig] = useState<BlynkConfig>(getStoredBlynkConfig);
  const [blynkConnected, setBlynkConnected] = useState<boolean | null>(null);
  const [hardwareConnected, setHardwareConnected] = useState<boolean>(false);
  const [serialLogs, setSerialLogs] = useState<string[]>([]);
  const [requestHistory, setRequestHistory] = useState<RequestRecord[]>([]);
  const [selectedNeed, setSelectedNeed] = useState<PatientNeed | null>(null);
  const [requestState, setRequestState] = useState<RequestState>('idle');
  const [blynkFeedback, setBlynkFeedback] = useState<{success: boolean; message: string; note?: string} | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeSpokenId, setActiveSpokenId] = useState<string | null>(null);
  const [isCaregiverOpen, setIsCaregiverOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const lastClickRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });
  const autoClearTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (accessibility.voiceName) speechService.setVoiceByName(accessibility.voiceName);
  }, [accessibility.voiceName]);

  const handleUpdateAccessibility = (partial: Partial<AccessibilitySettings>) => {
    setAccessibility((prev) => {
      const updated = { ...prev, ...partial };
      try { localStorage.setItem(STORAGE_KEY_ACCESSIBILITY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  useEffect(() => {
    checkBlynkStatus(blynkConfig).then((res) => setBlynkConnected(res.isConnected));
  }, [blynkConfig]);

  const handleSelectNeed = useCallback(async (need: PatientNeed) => {
    const now = Date.now();
    if (lastClickRef.current.id === need.id && now - lastClickRef.current.time < 250) return;
    lastClickRef.current = { id: need.id, time: now };
    if (autoClearTimerRef.current) clearTimeout(autoClearTimerRef.current);
    setSelectedNeed(need); setRequestState('sending'); setBlynkFeedback(null);
    setIsSpeaking(true); setActiveSpokenId(need.id);
    speechService.speak(need.spokenPhrase, accessibility.voiceFeedback, {
      rate: accessibility.voiceRate, pitch: accessibility.voicePitch, chime: accessibility.audioChime,
    }).finally(() => setIsSpeaking(false));
    sendBlynkNotification(need.id, need.label, need.spokenPhrase, blynkConfig).then((res) => {
      const newRecord: RequestRecord = {
        id: String(Date.now()), needId: need.id, label: need.label, phrase: need.spokenPhrase,
        timestamp: new Date().toISOString(), state: res.success ? 'confirmed' : 'failed',
        blynkStatus: { success: res.success, httpStatus: res.httpStatus, message: res.message, note: res.note },
      };
      setRequestHistory((prev) => [newRecord, ...prev]);
      if (res.success) {
        setRequestState('confirmed'); setBlynkFeedback({ success: true, message: res.message, note: res.note });
      } else {
        setRequestState('failed'); setBlynkFeedback({ success: false, message: res.message, note: 'Caregiver device status recorded.' });
      }
    }).catch((err: any) => {
      setRequestState('failed'); setBlynkFeedback({ success: false, message: err.message || 'Transmission failed.' });
    });
    autoClearTimerRef.current = setTimeout(() => {
      setActiveSpokenId(null);
      if (requestState === 'sending' || requestState === 'confirmed') setRequestState('idle');
    }, 6000);
  }, [accessibility, blynkConfig, requestState]);

  const handleQuickResponse = async (type: 'yes' | 'no') => {
    if (type === 'no' && (requestState === 'confirmed' || requestState === 'sending')) {
      setRequestState('cancelled'); setBlynkFeedback({ success: true, message: 'Alert cancelled by patient request' });
      await speechService.speak('Alert cancelled.', accessibility.voiceFeedback, {
        rate: accessibility.voiceRate, pitch: accessibility.voicePitch, chime: false,
      });
      setTimeout(() => { setRequestState('idle'); setSelectedNeed(null); }, 2500);
      return;
    }
    const spokenText = type === 'yes' ? 'Yes.' : 'No.';
    const needId = type === 'yes' ? 'quick_yes' : 'quick_no';
    const label = type === 'yes' ? 'YES' : 'NO';
    const quickNeed: PatientNeed = {
      id: needId as any, label, spokenPhrase: spokenText, iconName: type === 'yes' ? 'Check' : 'X',
      category: 'quick', description: type === 'yes' ? 'Affirmative response' : 'Negative response',
    };
    setSelectedNeed(quickNeed); setActiveSpokenId(needId); setIsSpeaking(true); setRequestState('confirmed');
    const newRecord: RequestRecord = {
      id: String(Date.now()), needId, label, phrase: spokenText, timestamp: new Date().toISOString(),
      state: 'confirmed', blynkStatus: { success: true, message: 'Spoken verbally' },
    };
    setRequestHistory((prev) => [newRecord, ...prev]);
    speechService.speak(spokenText, accessibility.voiceFeedback, {
      rate: accessibility.voiceRate, pitch: accessibility.voicePitch, chime: accessibility.audioChime,
    }).finally(() => setIsSpeaking(false));
    if (autoClearTimerRef.current) clearTimeout(autoClearTimerRef.current);
    autoClearTimerRef.current = setTimeout(() => { setActiveSpokenId(null); setRequestState('idle'); }, 4000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.key === 'y' || e.key === 'Y') { e.preventDefault(); handleQuickResponse('yes'); }
      else if (e.key === 'n' || e.key === 'N') { e.preventDefault(); handleQuickResponse('no'); }
      else {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 8) {
          const targetNeed = PATIENT_NEEDS[num - 1];
          if (targetNeed) { e.preventDefault(); handleSelectNeed(targetNeed); }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleQuickResponse, handleSelectNeed]);

  useEffect(() => {
    const unsubscribe = serialService.subscribe((event) => {
      setSerialLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ${event.type.toUpperCase()}: ${event.payload}`,
        ...prev.slice(0, 30),
      ]);
      if (event.type === 'select') {
        const payload = event.payload.toLowerCase();
        const num = parseInt(payload, 10);
        let match = null;
        if (!isNaN(num) && num >= 1 && num <= 8) match = PATIENT_NEEDS[num - 1];
        else match = PATIENT_NEEDS.find((n) => n.id === payload);
        if (match) handleSelectNeed(match);
      } else if (event.type === 'confirm') handleQuickResponse('yes');
      else if (event.type === 'cancel') handleQuickResponse('no');
    });
    return () => unsubscribe();
  }, [handleSelectNeed, handleQuickResponse]);

  const handleToggleHardware = async () => {
    if (hardwareConnected) {
      await serialService.disconnect(); setHardwareConnected(false);
      setSerialLogs((prev) => [`[${new Date().toLocaleTimeString()}] ESP32 Disconnected`, ...prev]);
    } else {
      try {
        await serialService.connect(); setHardwareConnected(true);
        setSerialLogs((prev) => [`[${new Date().toLocaleTimeString()}] ESP32 USB Connected @ 115200 baud`, ...prev]);
      } catch (err: any) {
        setHardwareConnected(false);
        setSerialLogs((prev) => [`[${new Date().toLocaleTimeString()}] Connect Error: ${err.message}`, ...prev]);
      }
    }
  };

  return (
    <div className={`h-screen max-h-screen overflow-hidden flex flex-col justify-between transition-colors bg-gradient-to-br from-sky-50/50 via-white to-blue-50/40 ${accessibility.largeText ? 'large-text' : ''} ${accessibility.highContrast ? 'high-contrast' : ''} ${accessibility.reducedMotion ? 'reduced-motion' : ''}`}>
      <Header accessibility={accessibility} onUpdateAccessibility={handleUpdateAccessibility}
        onOpenCaregiver={() => setIsCaregiverOpen(true)} onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        blynkConnected={blynkConnected} hardwareConnected={hardwareConnected} />
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <PatientBoard onSelectNeed={handleSelectNeed} onQuickResponse={handleQuickResponse}
          selectedNeedId={selectedNeed?.id || null} accessibility={accessibility} activeSpokenId={activeSpokenId} />
      </main>
      <footer className="shrink-0 border-t border-slate-200/80 bg-white/80 backdrop-blur-sm py-1 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-slate-700">CareConnect</span><span aria-hidden="true">·</span>
            <span className="hidden sm:inline">Zero-Scroll Assistive Mode</span><span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>Motion &amp; Speech Active</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={() => setIsAccessibilityOpen(true)} className="hover:text-slate-800 transition-colors underline font-medium cursor-pointer">Preferences</button>
            <button type="button" onClick={() => setIsCaregiverOpen(true)} className="hover:text-slate-800 transition-colors underline font-medium cursor-pointer">Firmware &amp; Hub</button>
          </div>
        </div>
      </footer>
      <ActiveAlertBanner need={selectedNeed} state={requestState} blynkFeedback={blynkFeedback}
        isSpeaking={isSpeaking} onDismiss={() => setRequestState('idle')} />
      <AccessibilityBar settings={accessibility} onUpdate={handleUpdateAccessibility}
        isOpen={isAccessibilityOpen} onClose={() => setIsAccessibilityOpen(false)} />
      <CaregiverModal isOpen={isCaregiverOpen} onClose={() => setIsCaregiverOpen(false)}
        blynkConfig={blynkConfig} onSaveBlynkConfig={(cfg) => { setBlynkConfig(cfg); saveStoredBlynkConfig(cfg); }}
        requestHistory={requestHistory} hardwareConnected={hardwareConnected}
        onToggleHardware={handleToggleHardware} serialLogs={serialLogs} />
    </div>
  );
}

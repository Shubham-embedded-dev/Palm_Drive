import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, X, Volume2 } from 'lucide-react';
import { PatientNeed, RequestState } from '../types';
interface ActiveAlertBannerProps { need: PatientNeed | null; state: RequestState; blynkFeedback: {success:boolean;message:string;note?:string}|null; isSpeaking:boolean; onDismiss:()=>void; }
export const ActiveAlertBanner: React.FC<ActiveAlertBannerProps> = ({need,state,blynkFeedback,isSpeaking,onDismiss}) => {
 if (!need || state==='idle') return null;
 const isSending=state==='sending', isFailed=state==='failed', isCancelled=state==='cancelled';
 return <aside aria-label="Active Alert Notification" className="fixed bottom-6 right-6 left-6 sm:left-auto sm:max-w-md z-40 animate-in slide-in-from-bottom-5 duration-200">
  <div className={`p-4 sm:p-5 rounded-2xl shadow-xl border-2 flex items-start justify-between gap-3 backdrop-blur-md ${isFailed?'bg-rose-50/95 border-rose-300 text-rose-950':isCancelled?'bg-slate-100/95 border-slate-300 text-slate-900':'bg-emerald-50/95 border-emerald-400 text-emerald-950 shadow-emerald-500/10'}`}>
   <div className="flex items-start gap-3"><div className="mt-0.5 shrink-0">{isSending?<Loader2 className="w-6 h-6 text-emerald-700 animate-spin"/>:isFailed?<AlertCircle className="w-6 h-6 text-rose-600"/>:<CheckCircle2 className="w-6 h-6 text-emerald-600"/>}</div>
   <div><div className="flex items-center gap-2"><h3 className="font-black text-sm sm:text-base leading-tight">{isSending&&`Transmitting: ${need.label}`}{isCancelled&&'Alert Cancelled'}{isFailed&&`Notice: ${need.label}`}{!isSending&&!isFailed&&!isCancelled&&`Alert Sent: ${need.label}`}</h3>{isSpeaking&&<span className="flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-100 px-1.5 py-0.5 rounded"><Volume2 className="w-3 h-3 animate-pulse"/>Speaking</span>}</div>
   <p className="text-xs font-semibold text-slate-700 mt-1">"{need.spokenPhrase}"</p>{blynkFeedback&&<p className="text-[11px] text-slate-600 mt-1 font-medium">{blynkFeedback.message} {blynkFeedback.note?`· ${blynkFeedback.note}`:''}</p>}</div></div>
   <button type="button" onClick={onDismiss} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors shrink-0" aria-label="Dismiss alert banner"><X className="w-4 h-4"/></button>
  </div></aside>;
};

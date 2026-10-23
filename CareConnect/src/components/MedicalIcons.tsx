import React from 'react';
import {Droplets,Utensils,Bath,Pill,Stethoscope,AlertTriangle,RefreshCw,BellRing,Check,X,HeartPulse,Accessibility,Activity} from 'lucide-react';
const ICONS:any={Droplets,Utensils,Bath,Pill,Stethoscope,SOS:AlertTriangle,AlertTriangle,RefreshCw,BellRing,Check,X,HeartPulse,Accessibility,Activity};
export const MedicalIcon:React.FC<{name:string;className?:string;size?:number}>=({name,className,size=24})=>{const Icon=ICONS[name]||HeartPulse;return <Icon className={className} size={size} aria-hidden="true"/>;};
export const MedicalIcons=MedicalIcon;
export default MedicalIcon;

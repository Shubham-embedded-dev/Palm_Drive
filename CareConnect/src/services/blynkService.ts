import { BlynkConfig, NeedId } from '../types';
const STORAGE_KEY_BLYNK_CONFIG='careconnect_blynk_config';
export const DEFAULT_BLYNK_CONFIG:BlynkConfig={authToken:'',serverUrl:'https://blynk.cloud',virtualPin:'V1',templateId:'TMPL_CARECONNECT'};
export function getStoredBlynkConfig():BlynkConfig {try{const raw=localStorage.getItem(STORAGE_KEY_BLYNK_CONFIG);if(raw)return {...DEFAULT_BLYNK_CONFIG,...JSON.parse(raw)};}catch{}return DEFAULT_BLYNK_CONFIG;}
export function saveStoredBlynkConfig(config:BlynkConfig):void {try{localStorage.setItem(STORAGE_KEY_BLYNK_CONFIG,JSON.stringify(config));}catch{}}
export interface BlynkNotificationResult {success:boolean;httpStatus?:number;message:string;note?:string;unconfigured?:boolean;}
export async function sendBlynkNotification(needId:NeedId,label:string,phrase:string,customConfig?:BlynkConfig):Promise<BlynkNotificationResult>{
 const config=customConfig||getStoredBlynkConfig();
 try{const response=await fetch('/api/blynk/notify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({needId,label,phrase,token:config.authToken||undefined,pin:config.virtualPin||'V1',serverUrl:config.serverUrl||'https://blynk.cloud'})});const data=await response.json();
 if(response.ok&&data.success)return {success:true,httpStatus:data.httpStatus||200,message:data.message||'Submitted to Blynk Cloud datastream.',note:data.note||'Datastream value updated.'};
 return {success:false,httpStatus:response.status,message:data.error||`Blynk transmission error (HTTP ${response.status})`,unconfigured:Boolean(data.unconfigured)};
 }catch(err:any){return {success:false,message:`Network transmission failure: ${err.message||'Cannot reach server proxy'}`};}
}
export async function checkBlynkStatus(customConfig?:BlynkConfig):Promise<{configured:boolean;isConnected:boolean;status:string}>{
 const config=customConfig||getStoredBlynkConfig();
 try{const response=await fetch('/api/blynk/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:config.authToken||undefined,serverUrl:config.serverUrl||'https://blynk.cloud'})});if(response.ok)return await response.json();return {configured:Boolean(config.authToken),isConnected:false,status:`HTTP ${response.status}`};}
 catch{return {configured:Boolean(config.authToken),isConnected:false,status:'Check Failed'};}
}

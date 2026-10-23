/**
 * Web Serial API Service for Direct ESP32 + MPU6050 Microcontroller Connection.
 * Reads SELECT:<id>, CONFIRM:YES and CONFIRM:NO commands over USB serial.
 */
type SerialCallback=(event:{type:'select'|'confirm'|'cancel'|'raw';payload:string})=>void;
class SerialService {
 private port:any=null; private reader:any=null; private isReading=false; private listeners:Set<SerialCallback>=new Set(); private lastMessageTime=0; private lastPayload='';
 public isSupported():boolean{return typeof navigator!=='undefined'&&'serial' in navigator;}
 public isConnected():boolean{return this.port!==null&&this.isReading;}
 public subscribe(callback:SerialCallback):()=>void{this.listeners.add(callback);return()=>this.listeners.delete(callback);}
 private notify(type:'select'|'confirm'|'cancel'|'raw',payload:string){const now=Date.now();if(payload===this.lastPayload&&now-this.lastMessageTime<400&&type!=='raw')return;this.lastMessageTime=now;this.lastPayload=payload;this.listeners.forEach(fn=>fn({type,payload}));}
 public async connect():Promise<boolean>{if(!this.isSupported())throw new Error('Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera.');try{this.port=await (navigator as any).serial.requestPort();await this.port.open({baudRate:115200});this.isReading=true;this.readLoop();return true;}catch(err:any){this.port=null;this.isReading=false;throw err;}}
 public async disconnect():Promise<void>{this.isReading=false;try{if(this.reader){await this.reader.cancel();this.reader=null;}if(this.port){await this.port.close();this.port=null;}}catch{}}
 private async readLoop(){while(this.port&&this.isReading&&this.port.readable){const textDecoder=new TextDecoderStream();const readableStreamClosed=this.port.readable.pipeTo(textDecoder.writable);this.reader=textDecoder.readable.getReader();let lineBuffer='';
 try{while(true){const {value,done}=await this.reader.read();if(done)break;if(value){lineBuffer+=value;const lines=lineBuffer.split(/\r?\n/);lineBuffer=lines.pop()||'';for(const line of lines){const trimmed=line.trim();if(!trimmed)continue;this.notify('raw',trimmed);if(trimmed.startsWith('SELECT:'))this.notify('select',trimmed.replace('SELECT:','').trim().toLowerCase());else if(trimmed==='CONFIRM:YES'||trimmed==='YES')this.notify('confirm','YES');else if(trimmed==='CONFIRM:NO'||trimmed==='NO')this.notify('cancel','NO');}}}}catch{}finally{try{this.reader.releaseLock();}catch{}}try{await readableStreamClosed;}catch{}}}
}
export const serialService=new SerialService();

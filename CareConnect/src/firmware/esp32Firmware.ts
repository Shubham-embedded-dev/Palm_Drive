export const ESP32_FIRMWARE_CODE = `/*
  CareConnect — Assistive Communication System
  ESP32 + MPU6050 Gesture & Assistive Input Controller
  Connections: SDA GPIO21, SCL GPIO22, optional confirm GPIO4, cancel GPIO5.
  Serial protocol at 115200 baud: SELECT:<id>, CONFIRM:YES, CONFIRM:NO
*/
#include <Wire.h>
const int MPU_ADDR=0x68;
const int PIN_BTN_CONFIRM=4;
const int PIN_BTN_CANCEL=5;
int16_t ax,ay,az,gx,gy,gz;
enum SystemState { STATE_IDLE, STATE_CONFIRM_PENDING };
SystemState currentState=STATE_IDLE;
int currentHighlightedIndex=0;
const char* NEED_IDS[8]={"water","food","washroom","medicine","medical_help","help_me","change_position","call_caregiver"};
const int TILT_THRESHOLD_X=5000;
const int TILT_THRESHOLD_Y=6000;
const int REST_DEADZONE=2500;
bool returnedToNeutral=true;
unsigned long lastActionTime=0;
const unsigned long ACTION_DEBOUNCE_MS=650;
void setup(){
 Serial.begin(115200); Wire.begin(21,22);
 pinMode(PIN_BTN_CONFIRM,INPUT_PULLUP); pinMode(PIN_BTN_CANCEL,INPUT_PULLUP);
 Wire.beginTransmission(MPU_ADDR); Wire.write(0x6B); Wire.write(0); Wire.endTransmission(true);
 Serial.println("--- CARECONNECT ESP32 GESTURE CONTROLLER READY ---");
 Serial.println("Commands: SELECT:<id>, CONFIRM:YES, CONFIRM:NO");
}
void readMPU6050(){
 Wire.beginTransmission(MPU_ADDR); Wire.write(0x3B); Wire.endTransmission(false); Wire.requestFrom(MPU_ADDR,14,true);
 if(Wire.available()>=14){ax=Wire.read()<<8|Wire.read();ay=Wire.read()<<8|Wire.read();az=Wire.read()<<8|Wire.read();Wire.read();Wire.read();gx=Wire.read()<<8|Wire.read();gy=Wire.read()<<8|Wire.read();gz=Wire.read()<<8|Wire.read();}
}
void loop(){
 readMPU6050(); unsigned long now=millis();
 if(digitalRead(PIN_BTN_CONFIRM)==LOW&&now-lastActionTime>ACTION_DEBOUNCE_MS){
  if(currentState==STATE_IDLE){Serial.print("SELECT:");Serial.println(NEED_IDS[currentHighlightedIndex]);currentState=STATE_CONFIRM_PENDING;}
  else{Serial.println("CONFIRM:YES");currentState=STATE_IDLE;}
  lastActionTime=now;delay(200);return;
 }
 if(digitalRead(PIN_BTN_CANCEL)==LOW&&now-lastActionTime>ACTION_DEBOUNCE_MS){
  if(currentState==STATE_CONFIRM_PENDING){Serial.println("CONFIRM:NO");currentState=STATE_IDLE;}
  lastActionTime=now;delay(200);return;
 }
 if(abs(ax)<REST_DEADZONE&&abs(ay)<REST_DEADZONE)returnedToNeutral=true;
 if(returnedToNeutral&&now-lastActionTime>ACTION_DEBOUNCE_MS){
  if(currentState==STATE_IDLE){
   if(ax>TILT_THRESHOLD_X){currentHighlightedIndex=(currentHighlightedIndex+1)%8;Serial.print("SELECT:");Serial.println(NEED_IDS[currentHighlightedIndex]);returnedToNeutral=false;lastActionTime=now;currentState=STATE_CONFIRM_PENDING;}
   else if(ax< -TILT_THRESHOLD_X){currentHighlightedIndex=(currentHighlightedIndex+7)%8;Serial.print("SELECT:");Serial.println(NEED_IDS[currentHighlightedIndex]);returnedToNeutral=false;lastActionTime=now;currentState=STATE_CONFIRM_PENDING;}
  }else if(currentState==STATE_CONFIRM_PENDING){
   if(ay>TILT_THRESHOLD_Y){Serial.println("CONFIRM:YES");currentState=STATE_IDLE;returnedToNeutral=false;lastActionTime=now;}
   else if(ay< -TILT_THRESHOLD_Y){Serial.println("CONFIRM:NO");currentState=STATE_IDLE;returnedToNeutral=false;lastActionTime=now;}
  }
 }
 delay(30);
}
`;

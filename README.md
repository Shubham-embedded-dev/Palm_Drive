# Palm_Drive
ESP32-based assistive device for motion-controlled computer interaction, webpage dwell-click, emergency SOS alerts, and fall detection using an MPU6050 sensor and Blynk IoT.
Motion-Controlled Assistive Device for Computer Interaction

An ESP32-based assistive technology prototype designed to support computer interaction through hand movement, with webpage interaction, emergency SOS alerts, and fall-detection notifications.

 ## Project Overview

This project combines embedded systems, motion sensing, a web-based interface, and IoT notifications to provide an alternative method of interacting with a computer.

The device is intended to explore accessible computer interaction for people who have difficulty using a conventional mouse or gripping input devices.

## Key Features

- Motion-Based Cursor Control: Hand movement is used to control the computer cursor.
- Single-Press Click: A single pushbutton press performs a left-click action.
- Webpage Dwell-Click: When the cursor remains over a supported webpage icon or button for five seconds, the webpage triggers the associated action automatically.
- Emergency SOS: Holding the pushbutton for three seconds sends an SOS notification to a phone through Blynk IoT.
- Fall Detection: An MPU6050 motion sensor is used to detect movement patterns interpreted by the prototype as a possible fall and send a notification.
- Compact Web Interaction: Webpage actions and associated audio are handled by the webpage itself.

## Hardware Components

- 2 × ESP32 development boards
- 1 × MPU6050 accelerometer and gyroscope module
- 1 × OLED display
- Pushbutton
- Computer/laptop
- Smartphone with Blynk IoT
- Connecting wires and required mounting materials
- USB/power supply appropriate for the hardware

## System Architecture

### ESP32 Unit 1

Handles the MPU6050 sensor, motion-related functions, pushbutton input, SOS notification, and fall-detection logic.

### ESP32 Unit 2

Used for the OLED display.

## Web Interface

Provides interactive webpage controls and the five-second dwell-trigger functionality. Cursor interaction and webpage actions depend on the implemented software.

## Blynk IoT

Used to deliver SOS and fall-related notifications to the connected phone.

## Software and Technologies

- Arduino IDE / ESP32 Arduino core
- Embedded C/C++
- MPU6050 sensor interface
- HTML, CSS, and JavaScript for the webpage
- Blynk IoT
- Git and GitHub

Confirm the exact libraries, board configuration, and communication method from the final source code before publishing.

## Working Principle

1. Hand movement is measured using the MPU6050-based sensing unit.
2. The implemented firmware uses the sensor readings for motion-related interaction.
3. The computer cursor interacts with the supported webpage interface.
4. A single pushbutton press performs a left-click.
5. If the cursor stays over a supported webpage control for five seconds, the webpage triggers its associated action.
6. Holding the pushbutton for three seconds initiates an SOS notification through Blynk IoT.
7. The fall-detection logic processes sensor movement and sends a notification when a possible fall is detected.

# Getting Started

1. Clone or download this repository.
2. Install the Arduino IDE and the appropriate ESP32 board package.
3. Install the libraries required by the source code.
4. Open the relevant firmware files and configure the correct board and port.
5. Add your own Wi-Fi and Blynk credentials locally.
6. Upload the firmware to the corresponding ESP32 boards.
7. Open the webpage using the setup instructions provided in "web-interface/".
8. Test cursor movement, clicking, dwell-trigger actions, SOS notifications, and fall-detection behaviour.



Applications

- Assistive computer interaction
- Accessibility-focused user interfaces
- Alternative input methods for people with limited hand mobility
- IoT-based emergency notification prototypes
- Educational projects involving embedded systems and motion sensing


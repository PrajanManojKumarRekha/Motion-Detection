🛠️ Technologies Used
Backend

Python 3.11 - Core programming language
MediaPipe 0.10.21 - Google's ML library for pose estimation
OpenCV 4.11 - Computer vision for webcam capture
WebSockets 15.0 - Real-time bidirectional communication
AsyncIO - Asynchronous I/O for concurrent operations

Frontend

Three.js r137 - 3D graphics library
WebGL - Hardware-accelerated graphics rendering
HTML5/CSS3 - Web interface
WebSocket API - Browser-side real-time communication

📋 Prerequisites

Python 3.10 or 3.11 (Python 3.12+ not yet supported by MediaPipe)
Webcam
Modern web browser (Chrome, Firefox, or Edge)
Windows, macOS, or Linux

🚀 Installation
1. Clone the Repository
bashgit clone <your-repo-url>
cd Motion-Detection
2. Create Virtual Environment
bash# Windows
python -m venv .venv
.venv\Scripts\Activate.ps1

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
3. Install Dependencies
bashpip install -r requirements.txt
🎮 Usage
1. Start the Python Server
bashpython pose_server.py
You should see:
✓ Webcam opened successfully on index 0
============================================================
WebSocket Server Starting...
============================================================
✓ Server running on ws://localhost:8765
✓ Open index.html in your browser to see the 3D visualization
============================================================
2. Open the Web Interface

Option 1: Double-click index.html
Option 2: Run Start-Process index.html (PowerShell)
Option 3: Open in browser: file:///path/to/index.html

3. Start Moving!

Stand in front of your webcam
Watch your movements mirrored on the 3D mannequin
Move your mouse to adjust camera angle

4. Stop the Server

Press ESC in the webcam window, or
Press Ctrl+C in the terminal

📁 Project Structure
Motion-Detection/
├── pose_server.py         # Python WebSocket server
│   ├── Webcam capture (OpenCV)
│   ├── Pose detection (MediaPipe)
│   └── Data streaming (WebSockets)
│
├── pose_renderer.js       # Three.js 3D renderer
│   ├── Mannequin creation
│   ├── Pose data processing
│   └── 3D scene rendering
│
├── index.html            # Web interface
│   ├── Three.js import (CDN)
│   └── UI overlay
│
├── requirements.txt      # Python dependencies
├── .gitignore           # Git ignore rules
└── README.md            # This file
🔧 How It Works
Data Flow
Webcam → OpenCV → MediaPipe → WebSocket → Browser → Three.js → Display
  30 FPS   |      33 landmarks    |         |        GPU        60 FPS
           |      (x,y,z coords)  |         |      rendering
           └──────────────────────┘         └────────────────────┘
              Python Backend                    JavaScript Frontend
Technical Pipeline

Capture - OpenCV reads webcam frames at ~30 FPS
Detection - MediaPipe extracts 33 3D body landmarks
Serialization - Convert to JSON: {"landmarks": [99 floats]}
Streaming - WebSocket sends data to browser
Parsing - JavaScript receives and parses coordinates
Positioning - Calculate 3D positions for 40+ body parts
Rendering - Three.js renders mannequin at 60 FPS

Coordinate System Transformation
MediaPipe Coordinates    →    Three.js Coordinates
X: Right                →    X: Right
Y: Down (image coords)   →    Y: Up (world coords)    [FLIP]
Z: Forward (away)        →    Z: Toward viewer        [FLIP]
🎨 Customization
Change Mannequin Colors
Edit pose_renderer.js:
javascriptconst skinMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x00d9ff,  // Change this hex color
});
Adjust Camera Position
javascriptcamera.position.set(0, 1, 2.5);  // (x, y, z)
Modify Detection Confidence
Edit pose_server.py:
pythonmp_pose.Pose(
    min_detection_confidence=0.5,  # 0.0 to 1.0
    min_tracking_confidence=0.5    # 0.0 to 1.0
)
🐛 Troubleshooting
Webcam Not Opening
ERROR: Could not open webcam
Solutions:

Close other apps using the camera (Teams, Zoom, etc.)
Check Windows Settings → Privacy → Camera
Try running as administrator
Check if camera index is correct (try 0, 1, or 2)

Browser Shows "Disconnected"
🔴 Connection Error
Solutions:

Ensure Python server is running first
Check port 8765 isn't used by another process
Disable firewall/antivirus temporarily
Try a different browser

Red Dots Instead of Mannequin
Solution: Clear browser cache
Ctrl + Shift + R    (Chrome/Edge)
Ctrl + F5           (Firefox)
Import Errors in VS Code
Solution: Select correct Python interpreter

Press Ctrl+Shift+P
Type "Python: Select Interpreter"
Choose .venv interpreter
Reload window

📊 Performance
MetricValueHardware DependentPose Detection30 FPSCPU3D Rendering60 FPSGPUWebSocket Latency20-50 msLocalTotal Latency100-150 msEnd-to-end
🔮 Future Enhancements

 Record and playback motion data
 Export to animation formats (BVH, FBX)
 Multi-person tracking
 Hand gesture recognition
 VR/AR integration
 Cloud deployment for remote access
 Mobile app support

📚 Key Concepts for Academic Presentation
1. Computer Vision

MediaPipe Pose: 33-point skeletal model
Landmark detection: ML-based joint localization
World coordinates: Real-world 3D positions (meters)

2. Real-Time Systems

WebSocket protocol: Full-duplex communication
Asynchronous I/O: Non-blocking operations
Frame synchronization: Client-server timing

3. 3D Graphics

Three.js abstractions: Scene graph, materials, lighting
WebGL rendering: GPU-accelerated graphics
Coordinate transformations: Matrix operations

4. System Integration

Multi-language pipeline: Python ↔ JavaScript
Data serialization: JSON format
Network protocols: TCP/IP, WebSocket

📖 References

MediaPipe Pose
Three.js Documentation
WebSocket Protocol RFC 6455
OpenCV Documentation

📄 License
This project is licensed under the MIT License.
👥 Contributors

Your Name - Initial work

🙏 Acknowledgments

Google MediaPipe team for the pose estimation model
Three.js community for the 3D graphics library
OpenCV developers for computer vision tools


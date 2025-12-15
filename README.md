# 3D Pose Visualization Project

## Overview
This project converts video recordings of people into 3D animated mannequins that you can view and rotate in a web browser. It uses Google's MediaPipe AI to track body movements from videos and displays them as a 3D model.

## What This Does
1. Takes a video file (MP4, AVI, MOV, etc.)
2. Analyzes each frame to find body landmarks (joints like shoulders, elbows, knees)
3. Saves the landmark data as a JSON file
4. Displays the data as an animated 3D mannequin in your browser

## Project Structure
```
project/
├── batch_process_videos.py    # Python script to process videos
├── viewer.html                 # Web page to view 3D animations
├── requirements.txt            # Python dependencies
├── videos/                     # Put your input videos here
└── json_output/               # Processed JSON files go here
```

## Installation

### Prerequisites
- Python 3.8 or higher
- A modern web browser (Chrome, Firefox, Edge)

### Step 1: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Create Folders
```bash
mkdir videos
mkdir json_output
```

## Usage

### Step 1: Process Videos
Place your video files in the `videos/` folder, then run:

```bash
python batch_process_videos.py --input_dir ./videos --output_dir ./json_output
```

**Optional Parameters:**
- `--min_detection_confidence 0.5` - How confident the AI needs to be (0.0 to 1.0)
- `--min_tracking_confidence 0.5` - How confident when tracking between frames

### Step 2: View in Browser
1. Open `viewer.html` in your browser (double-click it)
2. Click "Choose File" button
3. Select a JSON file from `json_output/` folder
4. Watch your 3D mannequin!

### Controls
- **Mouse Drag**: Rotate camera around mannequin
- **Mouse Wheel**: Zoom in/out
- **Play Button**: Start animation
- **Pause Button**: Stop animation
- **Slider**: Scrub through frames manually

## How It Works

### The Processing Pipeline
1. **Video Input** → Read video file frame by frame
2. **MediaPipe Analysis** → AI detects 33 body landmarks per frame
3. **Data Extraction** → Each landmark has X, Y, Z coordinates
4. **JSON Output** → All frames saved as array of coordinate arrays
5. **3D Rendering** → Browser reads JSON and draws 3D mannequin
6. **Animation** → Playback through frames creates movement

### Body Landmarks (33 Points)
MediaPipe tracks these points:
- **Face**: Nose, eyes, ears, mouth
- **Torso**: Shoulders, hips
- **Arms**: Elbows, wrists
- **Legs**: Knees, ankles
- **Hands**: Pinky, index, thumb points
- **Feet**: Heel, foot index

### Coordinate System
- **X**: Left (-) to Right (+)
- **Y**: Up (+) to Down (-) in video, flipped in 3D view
- **Z**: Away from camera (+) to toward camera (-)

## Customization Guide

### Adjust Playback Speed
In `viewer.html`, find:
```javascript
let frameSkip = 2;  // Change this number
```
- `1` = Full speed
- `2` = Half speed
- `3` = Third speed
- Higher = Slower

### Move Floor Up/Down
Find:
```javascript
ground.position.y = -2;  // Change this number
```
- Lower number = Floor goes down
- Higher number = Floor goes up

### Center the Mannequin
Find:
```javascript
x -= 1;  // Change this number
```
- Positive = Move left
- Negative = Move right
- `0` = No horizontal shift

### Adjust Arm Spreading
Find:
```javascript
if (x > 0) x *= 1.1;  // Change 1.1
```
- `1.0` = No spreading
- `1.1` = 10% wider
- `1.3` = 30% wider

### Change Mannequin Colors
Find:
```javascript
color: 0x00d9ff,  // Cyan color
```
Use hex color codes:
- `0xff0000` = Red
- `0x00ff00` = Green
- `0x0000ff` = Blue
- `0xffffff` = White
- `0x000000` = Black

### Scale Entire Mannequin
Find:
```javascript
const scale = 2;  // Change this number
```
- Higher = Bigger mannequin
- Lower = Smaller mannequin

### Make Body Parts Thicker/Thinner
Find in `createMannequin()`:
```javascript
mannequinParts.head = createSphere(0.12, skinMaterial);
```
First number = radius/thickness

Examples:
- Head: `0.12` (default)
- Arms: `0.05` (default)
- Legs: `0.07` (default)

## Common Issues

### Issue: Video processing is slow
**Solution**: Use shorter videos or lower resolution videos

### Issue: Mannequin looks distorted from side view
**Solution**: This is normal - MediaPipe estimates depth from 2D video. View from front for best results.

### Issue: Arms/legs disconnect during spins
**Solution**: This happens when MediaPipe loses tracking. Use videos with clear, well-lit subjects.

### Issue: Mannequin too small/big
**Solution**: Adjust `const scale = 2;` in the `getPosition()` function

### Issue: Mannequin under the floor
**Solution**: Lower the floor position: `ground.position.y = -3;`

## Technical Details

### Data Format
Each JSON file contains an array of frames:
```json
[
  [x0, y0, z0, x1, y1, z1, ... x32, y32, z32],  // Frame 0
  [x0, y0, z0, x1, y1, z1, ... x32, y32, z32],  // Frame 1
  ...
]
```

Each frame has 99 numbers (33 landmarks × 3 coordinates).

### Performance
- Processing: ~30-60 FPS depending on CPU
- Playback: 60 FPS in browser
- File size: ~1KB per second of video

## Credits
- **MediaPipe**: Google's pose estimation library
- **Three.js**: 3D rendering library
- **OpenCV**: Video processing

## License
This is an educational project. MediaPipe and Three.js have their own licenses.
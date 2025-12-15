import asyncio
import websockets
import json
import cv2
import mediapipe as mp
import numpy as np
import sys

# --- Global Definitions ---
mp_pose = mp.solutions.pose  # type: ignore

# 33 landmarks * 3 coordinates (x, y, z) = 99 features
POSE_FEATURES = 33 * 3 

# Try multiple camera indices
cap = None
for camera_index in [0, 1, 2]:
    cap = cv2.VideoCapture(camera_index)
    if cap.isOpened():
        print(f"✓ Webcam opened successfully on index {camera_index}")
        break
    cap.release()

if cap is None or not cap.isOpened():
    print("FATAL ERROR: Could not open any webcam. Check camera access.")
    print("Tips:")
    print("  - Close other apps using the camera (Teams, Zoom, etc.)")
    print("  - Check Windows camera privacy settings")
    print("  - Try running as administrator")
    sys.exit(1)

async def landmark_sender(websocket):
    print("✓ WebSocket client connected")
    
    global pose_model 
    
    try:
        while cap.isOpened():  #type: ignore
            # Use run_in_executor for blocking cv2.read()
            loop = asyncio.get_event_loop()
            ret, frame = await loop.run_in_executor(None, cap.read)  #type: ignore
            
            if not ret or frame is None:
                await asyncio.sleep(0.001) 
                continue

            # Process Frame
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image_rgb.flags.writeable = False
            
            # Process with MediaPipe
            results = pose_model.process(image_rgb)
            
            # Extract World Landmarks 
            landmarks = []
            if results.pose_world_landmarks:
                landmarks = np.array([[res.x, res.y, res.z] 
                                      for res in results.pose_world_landmarks.landmark]).flatten().tolist()
            else:
                landmarks = [0.0] * POSE_FEATURES

            # Serialize and Send
            data_to_send = json.dumps({"landmarks": landmarks})
            
            try:
                await websocket.send(data_to_send)
            except websockets.exceptions.ConnectionClosed:
                print("Client disconnected")
                break 
            except Exception as send_e:
                print(f"Error during send: {send_e}")
                break 
            
            # Optional: Display the feed
            cv2.imshow('MediaPipe Pose Feed (Press ESC to quit)', frame)
            if cv2.waitKey(1) & 0xFF == 27:  # ESC to exit
                print("ESC pressed - shutting down...")
                break 
            
    except Exception as e:
        print(f"Error in landmark_sender: {e}")
    finally:
        print("Connection closed")


async def main():
    global pose_model 
    
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose_model:
        print("=" * 60)
        print("WebSocket Server Starting...")
        print("=" * 60)
        
        try:
            async with websockets.serve(landmark_sender, "localhost", 8765):
                print("✓ Server running on ws://localhost:8765")
                print("✓ Open index.html in your browser to see the 3D visualization")
                print("✓ Press ESC in the camera window to stop")
                print("=" * 60)
                await asyncio.Future()
        except OSError as e:
            print(f"ERROR: Could not start server. {e}")
            print("Port 8765 might be in use. Close other instances.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n✓ Server shutting down...")
    finally:
        if cap is not None:
            cap.release()
        cv2.destroyAllWindows()
        print("✓ Cleanup complete")
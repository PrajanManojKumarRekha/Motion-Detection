import argparse
import cv2
import mediapipe as mp
import numpy as np
import json
from pathlib import Path
import time

mp_pose = mp.solutions.pose #type: ignore

NUM_POSE_LANDMARKS = 33
POSE_FEATURES = NUM_POSE_LANDMARKS * 3

def extract_landmarks(results):
    """Extracts pose landmarks only into a flat numpy array."""
    if results.pose_landmarks:
        pose = np.array([[res.x, res.y, res.z] for res in results.pose_landmarks.landmark]).flatten()
    else:
        pose = np.zeros(POSE_FEATURES)
    
    return pose.tolist()

def process_video(video_path: Path, output_dir: Path, pose_model):
    """Processes a single video file and extracts pose landmarks frame by frame."""
    video_name = video_path.stem
    output_json_path = output_dir / f"{video_name}.json"

    if output_json_path.exists():
        print(f"  Skipping '{video_path.name}', JSON already exists")
        return

    sequence_data = []
    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():
        print(f"  Error: Could not open video file {video_path.name}")
        return

    frame_count = 0
    start_time = time.time()

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image_rgb.flags.writeable = False

        results = pose_model.process(image_rgb)
        landmarks = extract_landmarks(results)
        sequence_data.append(landmarks)
        frame_count += 1

    cap.release()
    end_time = time.time()
    processing_time = end_time - start_time

    if not sequence_data:
        print(f"  Warning: No landmarks extracted from {video_path.name}")
        return

    try:
        with open(output_json_path, 'w') as f:
            json.dump(sequence_data, f)
        print(f"  Successfully processed '{video_path.name}' ({frame_count} frames) -> '{output_json_path.name}' ({processing_time:.2f}s)")
    except Exception as e:
        print(f"  Error saving data for {video_path.name}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Batch process videos to extract MediaPipe Pose landmarks.")
    parser.add_argument("--input_dir", required=True, help="Directory containing the input video files.")
    parser.add_argument("--output_dir", required=True, help="Directory where the output JSON files will be saved.")
    parser.add_argument("--min_detection_confidence", type=float, default=0.5)
    parser.add_argument("--min_tracking_confidence", type=float, default=0.5)

    args = parser.parse_args()

    input_path = Path(args.input_dir)
    output_path = Path(args.output_dir)

    if not input_path.is_dir():
        print(f"Error: Input directory not found: {input_path}")
        return

    output_path.mkdir(parents=True, exist_ok=True)
    print(f"Output will be saved to: {output_path.resolve()}")

    video_extensions = {".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv"}
    video_files = [f for f in input_path.iterdir() if f.is_file() and f.suffix.lower() in video_extensions]

    if not video_files:
        print(f"No video files found in {input_path}")
        return

    print(f"Found {len(video_files)} video files to process.")

    try:
        with mp_pose.Pose(
            min_detection_confidence=args.min_detection_confidence,
            min_tracking_confidence=args.min_tracking_confidence
        ) as pose:

            for video_file in video_files:
                print(f"Processing: {video_file.name}...")
                try:
                    process_video(video_file, output_path, pose)
                except Exception as e:
                    print(f"  !! Unhandled error processing {video_file.name}: {e}")

    except Exception as e:
        print(f"Error initializing MediaPipe Pose: {e}")
        return

    print("\nBatch processing complete.")

if __name__ == "__main__":
    main()
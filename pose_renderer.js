// --- 3D Scene Initialization ---
let scene, camera, renderer;
let mannequinParts = {}; // Object to hold body part meshes
let landmarks = new Array(99).fill(0); // Store latest landmark data

// MediaPipe landmark indices for major body parts
const LANDMARK_INDICES = {
    // Head
    nose: 0,
    leftEye: 2,
    rightEye: 5,
    leftEar: 7,
    rightEar: 8,
    
    // Torso
    leftShoulder: 11,
    rightShoulder: 12,
    leftHip: 23,
    rightHip: 24,
    
    // Arms
    leftElbow: 13,
    rightElbow: 14,
    leftWrist: 15,
    rightWrist: 16,
    
    // Legs
    leftKnee: 25,
    rightKnee: 26,
    leftAnkle: 27,
    rightAnkle: 28,
    
    // Hands
    leftPinky: 17,
    rightPinky: 18,
    leftIndex: 19,
    rightIndex: 20,
    leftThumb: 21,
    rightThumb: 22,
    
    // Feet
    leftHeel: 29,
    rightHeel: 30,
    leftFootIndex: 31,
    rightFootIndex: 32
};

function getPosition(landmarkIndex) {
    const x = landmarks[landmarkIndex * 3];
    const y = -landmarks[landmarkIndex * 3 + 1]; // Flip Y
    const z = -landmarks[landmarkIndex * 3 + 2]; // Flip Z
    return new THREE.Vector3(x, y, z);
}

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 3, 10);
    
    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 2.5);
    camera.lookAt(0, 0.5, 0);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);
    
    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);
    
    const backLight = new THREE.DirectionalLight(0xff8844, 0.2);
    backLight.position.set(0, 5, -5);
    scene.add(backLight);
    
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0f3460,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.y = -0.01;
    scene.add(ground);
    
    // Grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x16213e, 0x0f3460);
    scene.add(gridHelper);
    
    // Create mannequin
    createMannequin();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Add connection status
    createStatusIndicator();
    
    // Mouse controls for camera
    window.cameraMouseX = 0;
    window.cameraMouseY = 0;
    document.addEventListener('mousemove', (event) => {
        window.cameraMouseX = (event.clientX / window.innerWidth - 0.5) * 0.5;
        window.cameraMouseY = (event.clientY / window.innerHeight - 0.5) * 0.5;
    });
}

function createMannequin() {
    // Material for body parts
    const skinMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00d9ff,
        roughness: 0.5,
        metalness: 0.1,
        emissive: 0x001122,
        emissiveIntensity: 0.2
    });
    
    const jointMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0099cc,
        roughness: 0.3,
        metalness: 0.3,
        emissive: 0x003344,
        emissiveIntensity: 0.3
    });
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.12, 32, 32);
    mannequinParts.head = new THREE.Mesh(headGeometry, skinMaterial);
    mannequinParts.head.castShadow = true;
    scene.add(mannequinParts.head);
    
    // Neck
    mannequinParts.neck = createCylinder(0.05, 0.15, skinMaterial);
    scene.add(mannequinParts.neck);
    
    // Torso (upper)
    mannequinParts.upperTorso = createCylinder(0.15, 0.25, skinMaterial);
    scene.add(mannequinParts.upperTorso);
    
    // Torso (lower)
    mannequinParts.lowerTorso = createCylinder(0.13, 0.2, skinMaterial);
    scene.add(mannequinParts.lowerTorso);
    
    // Shoulders (joints)
    mannequinParts.leftShoulder = createSphere(0.06, jointMaterial);
    mannequinParts.rightShoulder = createSphere(0.06, jointMaterial);
    scene.add(mannequinParts.leftShoulder);
    scene.add(mannequinParts.rightShoulder);
    
    // Upper arms
    mannequinParts.leftUpperArm = createCylinder(0.05, 0.25, skinMaterial);
    mannequinParts.rightUpperArm = createCylinder(0.05, 0.25, skinMaterial);
    scene.add(mannequinParts.leftUpperArm);
    scene.add(mannequinParts.rightUpperArm);
    
    // Elbows
    mannequinParts.leftElbow = createSphere(0.05, jointMaterial);
    mannequinParts.rightElbow = createSphere(0.05, jointMaterial);
    scene.add(mannequinParts.leftElbow);
    scene.add(mannequinParts.rightElbow);
    
    // Forearms
    mannequinParts.leftForearm = createCylinder(0.04, 0.25, skinMaterial);
    mannequinParts.rightForearm = createCylinder(0.04, 0.25, skinMaterial);
    scene.add(mannequinParts.leftForearm);
    scene.add(mannequinParts.rightForearm);
    
    // Wrists
    mannequinParts.leftWrist = createSphere(0.04, jointMaterial);
    mannequinParts.rightWrist = createSphere(0.04, jointMaterial);
    scene.add(mannequinParts.leftWrist);
    scene.add(mannequinParts.rightWrist);
    
    // Hands
    mannequinParts.leftHand = createSphere(0.05, skinMaterial);
    mannequinParts.rightHand = createSphere(0.05, skinMaterial);
    scene.add(mannequinParts.leftHand);
    scene.add(mannequinParts.rightHand);
    
    // Hips
    mannequinParts.leftHip = createSphere(0.06, jointMaterial);
    mannequinParts.rightHip = createSphere(0.06, jointMaterial);
    scene.add(mannequinParts.leftHip);
    scene.add(mannequinParts.rightHip);
    
    // Upper legs (thighs)
    mannequinParts.leftThigh = createCylinder(0.07, 0.4, skinMaterial);
    mannequinParts.rightThigh = createCylinder(0.07, 0.4, skinMaterial);
    scene.add(mannequinParts.leftThigh);
    scene.add(mannequinParts.rightThigh);
    
    // Knees
    mannequinParts.leftKnee = createSphere(0.06, jointMaterial);
    mannequinParts.rightKnee = createSphere(0.06, jointMaterial);
    scene.add(mannequinParts.leftKnee);
    scene.add(mannequinParts.rightKnee);
    
    // Lower legs (shins)
    mannequinParts.leftShin = createCylinder(0.05, 0.4, skinMaterial);
    mannequinParts.rightShin = createCylinder(0.05, 0.4, skinMaterial);
    scene.add(mannequinParts.leftShin);
    scene.add(mannequinParts.rightShin);
    
    // Ankles
    mannequinParts.leftAnkle = createSphere(0.05, jointMaterial);
    mannequinParts.rightAnkle = createSphere(0.05, jointMaterial);
    scene.add(mannequinParts.leftAnkle);
    scene.add(mannequinParts.rightAnkle);
    
    // Feet
    const footGeometry = new THREE.BoxGeometry(0.08, 0.06, 0.15);
    mannequinParts.leftFoot = new THREE.Mesh(footGeometry, skinMaterial);
    mannequinParts.rightFoot = new THREE.Mesh(footGeometry, skinMaterial);
    mannequinParts.leftFoot.castShadow = true;
    mannequinParts.rightFoot.castShadow = true;
    scene.add(mannequinParts.leftFoot);
    scene.add(mannequinParts.rightFoot);
}

function createCylinder(radius, height, material) {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 16);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    return mesh;
}

function createSphere(radius, material) {
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    return mesh;
}

function positionCylinderBetween(cylinder, start, end) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    
    cylinder.position.copy(center);
    cylinder.scale.y = length / 0.25; // 0.25 is the default cylinder height
    
    // Orient cylinder
    cylinder.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize()
    );
}

function updateMannequin() {
    // Check if we have valid data
    const hasValidPose = landmarks.some(val => val !== 0);
    if (!hasValidPose) {
        Object.values(mannequinParts).forEach(part => part.visible = false);
        return;
    }
    
    Object.values(mannequinParts).forEach(part => part.visible = true);
    
    // Get key positions
    const nose = getPosition(LANDMARK_INDICES.nose);
    const leftShoulder = getPosition(LANDMARK_INDICES.leftShoulder);
    const rightShoulder = getPosition(LANDMARK_INDICES.rightShoulder);
    const leftElbow = getPosition(LANDMARK_INDICES.leftElbow);
    const rightElbow = getPosition(LANDMARK_INDICES.rightElbow);
    const leftWrist = getPosition(LANDMARK_INDICES.leftWrist);
    const rightWrist = getPosition(LANDMARK_INDICES.rightWrist);
    const leftHip = getPosition(LANDMARK_INDICES.leftHip);
    const rightHip = getPosition(LANDMARK_INDICES.rightHip);
    const leftKnee = getPosition(LANDMARK_INDICES.leftKnee);
    const rightKnee = getPosition(LANDMARK_INDICES.rightKnee);
    const leftAnkle = getPosition(LANDMARK_INDICES.leftAnkle);
    const rightAnkle = getPosition(LANDMARK_INDICES.rightAnkle);
    const leftFootIndex = getPosition(LANDMARK_INDICES.leftFootIndex);
    const rightFootIndex = getPosition(LANDMARK_INDICES.rightFootIndex);
    
    // Calculate derived positions
    const shoulderCenter = new THREE.Vector3().addVectors(leftShoulder, rightShoulder).multiplyScalar(0.5);
    const hipCenter = new THREE.Vector3().addVectors(leftHip, rightHip).multiplyScalar(0.5);
    
    // Head
    mannequinParts.head.position.copy(nose);
    
    // Neck
    positionCylinderBetween(mannequinParts.neck, nose, shoulderCenter);
    
    // Torso
    const torsoMid = new THREE.Vector3().lerpVectors(shoulderCenter, hipCenter, 0.5);
    positionCylinderBetween(mannequinParts.upperTorso, shoulderCenter, torsoMid);
    positionCylinderBetween(mannequinParts.lowerTorso, torsoMid, hipCenter);
    
    // Shoulders
    mannequinParts.leftShoulder.position.copy(leftShoulder);
    mannequinParts.rightShoulder.position.copy(rightShoulder);
    
    // Arms
    positionCylinderBetween(mannequinParts.leftUpperArm, leftShoulder, leftElbow);
    positionCylinderBetween(mannequinParts.rightUpperArm, rightShoulder, rightElbow);
    
    mannequinParts.leftElbow.position.copy(leftElbow);
    mannequinParts.rightElbow.position.copy(rightElbow);
    
    positionCylinderBetween(mannequinParts.leftForearm, leftElbow, leftWrist);
    positionCylinderBetween(mannequinParts.rightForearm, rightElbow, rightWrist);
    
    mannequinParts.leftWrist.position.copy(leftWrist);
    mannequinParts.rightWrist.position.copy(rightWrist);
    
    mannequinParts.leftHand.position.copy(leftWrist);
    mannequinParts.rightHand.position.copy(rightWrist);
    
    // Hips
    mannequinParts.leftHip.position.copy(leftHip);
    mannequinParts.rightHip.position.copy(rightHip);
    
    // Legs
    positionCylinderBetween(mannequinParts.leftThigh, leftHip, leftKnee);
    positionCylinderBetween(mannequinParts.rightThigh, rightHip, rightKnee);
    
    mannequinParts.leftKnee.position.copy(leftKnee);
    mannequinParts.rightKnee.position.copy(rightKnee);
    
    positionCylinderBetween(mannequinParts.leftShin, leftKnee, leftAnkle);
    positionCylinderBetween(mannequinParts.rightShin, rightKnee, rightAnkle);
    
    mannequinParts.leftAnkle.position.copy(leftAnkle);
    mannequinParts.rightAnkle.position.copy(rightAnkle);
    
    // Feet
    const leftFootDir = new THREE.Vector3().subVectors(leftFootIndex, leftAnkle);
    mannequinParts.leftFoot.position.copy(leftAnkle).add(leftFootDir.multiplyScalar(0.5));
    mannequinParts.leftFoot.lookAt(leftFootIndex);
    
    const rightFootDir = new THREE.Vector3().subVectors(rightFootIndex, rightAnkle);
    mannequinParts.rightFoot.position.copy(rightAnkle).add(rightFootDir.multiplyScalar(0.5));
    mannequinParts.rightFoot.lookAt(rightFootIndex);
}

function createStatusIndicator() {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'status';
    statusDiv.style.cssText = 'position:absolute;top:20px;left:20px;color:white;font-family:monospace;font-size:14px;padding:15px;background:rgba(0,0,0,0.8);border-radius:8px;border-left:4px solid #00d9ff;';
    statusDiv.innerHTML = '🔴 Disconnected';
    document.body.appendChild(statusDiv);
}

function updateStatus(message, color) {
    const statusDiv = document.getElementById('status');
    if (statusDiv) {
        statusDiv.innerHTML = message;
        statusDiv.style.borderLeftColor = color;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- WebSocket Communication ---
let ws;
function connectWebSocket() {
    ws = new WebSocket("ws://localhost:8765");

    ws.onopen = () => {
        console.log("✓ Connected to Python Pose Server");
        updateStatus('🟢 Connected', '#00ff00');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.landmarks && data.landmarks.length === 99) {
            landmarks = data.landmarks;
        }
    };

    ws.onclose = () => {
        console.log("Connection closed. Retrying in 3 seconds...");
        updateStatus('🟡 Reconnecting...', '#ffff00');
        setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        updateStatus('🔴 Connection Error', '#ff0000');
    };
}

// --- Main Loop ---
function animate() {
    requestAnimationFrame(animate);
    
    // Update mannequin with latest pose data
    updateMannequin();
    
    // Subtle camera movement based on mouse
    camera.position.x = window.cameraMouseX;
    camera.position.y = 1 - window.cameraMouseY * 0.5;
    camera.lookAt(0, 0.5, 0);
    
    renderer.render(scene, camera);
}

// --- Start ---
console.log("🎭 Initializing 3D Mannequin...");
init();
connectWebSocket();
animate();
console.log("✓ Ready! Strike a pose!");
import * as THREE from 'three';

let forward = false;
let right = false;
let left = false;
let fire = false;
let rocket = false;
const cooldownTime = 5000;
let lastTurnTime = 0;

export function setupControls() {
    document.addEventListener("keydown", onDocumentKeyDown, false);
    document.addEventListener("keyup", onDocumentKeyUp, false);
}

function onDocumentKeyDown(event) {
    const keyCode = event.which;
    const currentTime = Date.now();

    if (keyCode === 87) { // W
        forward = true;
    }
    if (keyCode === 68 && currentTime - lastTurnTime > cooldownTime) { // D
        if (!right){
            right = true;
            lastTurnTime = currentTime;
        }
    }
    if (keyCode === 65 && currentTime - lastTurnTime > cooldownTime) { // D
        if (!left){
            left = true;
            lastTurnTime = currentTime;
        }
    }
    if (event.code === "Space") {
        fire = true;
    }
    if (event.key === 'Shift') {
        rocket = true;
    }
}

function onDocumentKeyUp(event) {
    const keyCode = event.which;

    if (keyCode === 87) { // W
        forward = false;
    }
    if (keyCode === 68) { // D
        right = false;
    }
    if (keyCode === 65) { // A
        left = false;
    }
    if (event.code === "Space") {
        fire = false;
    }
    if (event.key === 'Shift') {
        rocket = false;
    }
}

// Funkcja uniku
export function dodge(speed, controls, scene, modelContainer) {
    const duration = 500;
    const cooldown = 5000;
    const startTime = Date.now();

    // Tworzenie wskaźnika cooldownu (kółka)
    const geometry = new THREE.CircleGeometry(2, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 1 });
    const dodgeIndicator = new THREE.Mesh(geometry, material);

    scene.add(dodgeIndicator);

    // Logika uniku
    const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;

        controls.moveRight(speed);

        if (elapsedTime >= duration) {
            clearInterval(interval);
        }
    }, 1);

    // Cooldown (zmniejszanie koła)
    const cooldownStartTime = Date.now();
    const cooldownInterval = setInterval(() => {
        const elapsedCooldown = Date.now() - cooldownStartTime;
        const scale = Math.max(0, 1 - elapsedCooldown / cooldown);

        dodgeIndicator.scale.set(scale, scale, scale);

        const offsetY = 2;
        dodgeIndicator.position.copy(modelContainer.position);
        dodgeIndicator.position.y += offsetY;

        dodgeIndicator.rotation.copy(modelContainer.rotation);

        if (elapsedCooldown >= cooldown) {
            clearInterval(cooldownInterval);
            scene.remove(dodgeIndicator);
        }
    }, 16);
}



export function getControlStates() {
    const currentState = { forward, right, left, fire, rocket };
    right = false;
    left = false;
    fire = false;
    rocket = false;
    return currentState;
}
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
    const duration = 500; // Czas trwania uniku
    const cooldown = 5000; // Czas cooldownu
    const startTime = Date.now();

    // Tworzenie licznika
    let dodgeCounter = document.createElement('div');
    dodgeCounter.style.position = 'absolute';
    dodgeCounter.style.top = '90%'; // Ustawienie pozycji licznika
    dodgeCounter.style.left = '50%';
    dodgeCounter.style.transform = 'translate(-50%, -50%)';
    dodgeCounter.style.fontSize = '32px';
    dodgeCounter.style.color = '#00ff00';
    dodgeCounter.style.fontFamily = 'Arial, sans-serif';
    dodgeCounter.style.zIndex = '1000';
    document.body.appendChild(dodgeCounter);

    // Logika uniku
    const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;

        controls.moveRight(speed);

        if (elapsedTime >= duration) {
            clearInterval(interval);
        }
    }, 1);

    // Cooldown (licznik odliczania)
    const cooldownStartTime = Date.now();
    const cooldownInterval = setInterval(() => {
        const elapsedCooldown = Date.now() - cooldownStartTime;
        const remainingTime = Math.max(0, (cooldown - elapsedCooldown) / 1000).toFixed(1); // Licznik w sekundach

        dodgeCounter.textContent = `Dodge Cooldown: ${remainingTime}s`;

        if (elapsedCooldown >= cooldown) {
            clearInterval(cooldownInterval);
            setTimeout(() => {
                document.body.removeChild(dodgeCounter); // Usunięcie licznika po cooldownie
            }, 1000); // Po sekundzie od usunięcia tekstu
        }
    }, 100); // Aktualizacja co 100 ms (dla płynnego odliczania)
}




export function getControlStates() {
    const currentState = { forward, right, left, fire, rocket };
    right = false;
    left = false;
    fire = false;
    rocket = false;
    return currentState;
}
let forward = false;
let right = false;
let left = false;
let fire = false;
let rocket = false;
const cooldownTime = 5000;
const cooldown = document.getElementById('cooldown');
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
            cooldown.style.right = "40%";
            cooldown.style.left = "";
        }
    }
    if (keyCode === 65 && currentTime - lastTurnTime > cooldownTime) { // A
        if (!left){
            left = true;
            lastTurnTime = currentTime;
            cooldown.style.left = "40%";
            cooldown.style.right = "";
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
export function dodge(speed, controls) {
    const duration = 500; // Czas trwania uniku
    const startTime = Date.now();

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
        
        cooldown.style.display = "block";

        if (elapsedCooldown >= cooldownTime) {
            clearInterval(cooldownInterval);
            cooldown.style.display = "none";
        }
        if (!controls.isLocked)
            cooldown.style.display = "none";
    }); 

    return cooldownInterval;
}

export function getControlStates() {
    const currentState = { forward, right, left, fire, rocket };
    right = false;
    left = false;
    fire = false;
    rocket = false;
    return currentState;
}

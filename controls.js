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
    if (keyCode === 65 && currentTime - lastTurnTime > cooldownTime) { // A
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
export function dodge(speed, controls) {
    const duration = 500; // Czas trwania uniku
    const startTime = Date.now();

    // Logika uniku
    const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;

        controls.moveRight(speed);

        if (elapsedTime >= duration) {
            clearInterval(interval);
        }
    }, 1);

    // Tworzenie licznika
    let dodgeCounter = document.createElement('div');
    dodgeCounter.style.position = 'absolute';
    dodgeCounter.style.top = '90%'; // Ustawienie pozycji licznika
    dodgeCounter.style.left = '50%';
    dodgeCounter.style.transform = 'translate(-50%, -50%)';
    dodgeCounter.style.fontSize = '32px';
    dodgeCounter.style.color = '#fffff';
    dodgeCounter.style.zIndex = '1000';
    document.body.appendChild(dodgeCounter);

    // Cooldown (licznik odliczania)
    const cooldownStartTime = Date.now();

    const cooldownInterval = setInterval(() => {
        const elapsedCooldown = Date.now() - cooldownStartTime;
        const remainingTime = Math.max(0, (cooldownTime - elapsedCooldown) / 1000).toFixed(1); // Licznik w sekundach

        dodgeCounter.textContent = `Unik niedostępny przez: ${remainingTime}s`;

        if (elapsedCooldown >= cooldownTime) {
            clearInterval(cooldownInterval);
            document.body.removeChild(dodgeCounter); // Usunięcie licznika po cooldownie
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

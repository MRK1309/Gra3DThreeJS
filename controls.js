let forward = false;
let right = false;
let left = false;
let fire = false;
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
}

export function getControlStates() {
    const currentState = { forward, right, left, fire };
    right = false;
    left = false;
    fire = false;
    return currentState;
}

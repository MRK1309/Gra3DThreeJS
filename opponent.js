import * as THREE from 'three';

const geometry = new THREE.CircleGeometry(1, 32);
const material2 = new THREE.MeshBasicMaterial({ color: 0xed0909 });
const opponentHit = new THREE.Mesh(geometry, material2);

// Pasek życia przeciwnika
let healthBar;
let healthBarContainer;

export function setupOpponentHealthBar(opponentModelContainer) {
    const barWidth = 2;
    const barHeight = 0.2;

    const barGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
    const barMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    healthBar = new THREE.Mesh(barGeometry, barMaterial);

    const containerGeometry = new THREE.PlaneGeometry(barWidth + 0.1, barHeight + 0.1);
    const containerMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
    healthBarContainer = new THREE.Mesh(containerGeometry, containerMaterial);

    healthBar.position.set(0, 3, 0); // Nad przeciwnikiem
    healthBarContainer.position.set(0, 3, 0);

    opponentModelContainer.add(healthBarContainer);
    opponentModelContainer.add(healthBar);
}

export function updateOpponentHealthBar(health, maxHealth = 10) {
    if (healthBar) {
        const healthRatio = Math.max(health / maxHealth, 0); // Zapewnia, że pasek nie ma ujemnej długości
        healthBar.scale.x = healthRatio;
        healthBar.position.x = (1 - healthRatio) * -0.5; // Dopasowanie pozycji paska życia
    }
}

export function updateHealthBarOrientation(camera) {
    const cameraPosition = new THREE.Vector3();
    camera.getWorldPosition(cameraPosition);

    if (healthBarContainer) {
        healthBarContainer.lookAt(cameraPosition); // Ustawienie orientacji przodem do kamery
    }
    if (healthBar) {
        healthBar.lookAt(cameraPosition); // Ustawienie orientacji przodem do kamery
    }
}

export function opponentFollow(opponent, modelContainer) {
    const modelPosition = new THREE.Vector3();
    modelContainer.getWorldPosition(modelPosition);

    const directionToModel = new THREE.Vector3().subVectors(modelPosition, opponent.position).normalize();
    const distanceToModel = modelPosition.distanceTo(opponent.position);

    let direction = new THREE.Vector3();

    const offset = 0.1;
    if (distanceToModel > 20) {
        direction = directionToModel;
        opponent.position.add(direction.multiplyScalar(offset));
    } else {
        direction = directionToModel.negate();
        opponent.position.add(direction.multiplyScalar(offset));
    }

    const turnSpeed = 0.1;
    const currentRotation = opponent.rotation.y;
    const targetRotation = Math.atan2(direction.x, direction.z);

    opponent.rotation.y = THREE.MathUtils.lerp(currentRotation, targetRotation, turnSpeed);
}

export function opponentGetHit(opponentModelContainer, modelContainer, scene) {
    opponentHit.position.copy(opponentModelContainer.position);
    opponentHit.rotation.copy(modelContainer.rotation);
    scene.add(opponentHit);
}

export function checkHit(opponentModelContainer, scene) {
    if (opponentHit.position.distanceTo(opponentModelContainer.position) > 1) {
        scene.remove(opponentHit);
    }
}

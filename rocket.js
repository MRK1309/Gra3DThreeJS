import * as THREE from 'three';
// Zmienna przechowująca liczbę dostępnych rakiet
let availableRockets = 2;

// Funkcja aktualizująca widoczność ikon rakiet
function updateRocketIcons() {
    if (availableRockets === 1) {
        document.getElementById('rocket2').style.display = 'none';
    } else if (availableRockets === 0) {
        document.getElementById('rocket1').style.display = 'none';
    }
}
export function fireRocket(scene, rocketContainer, modelContainer, opponentModelContainer, projectiles) {
    const activeRockets = projectiles.filter(projectile => projectile.userData.type === 'rocket');
    if (availableRockets > 0) {    
        if (activeRockets.length >= 2) return;

        if (rocketContainer) {
            const rocket = rocketContainer.clone();
            rocket.position.copy(modelContainer.position);
            rocket.scale.set(0.25, 0.25, 0.25);

            const opponentPosition = new THREE.Vector3();
            opponentModelContainer.getWorldPosition(opponentPosition);
            const directionToOpponent = new THREE.Vector3().subVectors(opponentPosition, rocket.position).normalize();

            if (scene.children.includes(opponentModelContainer)) {
                rocket.userData = {
                    velocity: directionToOpponent.multiplyScalar(0.5),
                    type: 'rocket'
                };
                rocket.lookAt(opponentPosition);
            } else {
                rocket.userData = {
                    velocity: new THREE.Vector3(0, 0, -1).applyQuaternion(modelContainer.quaternion).multiplyScalar(0.5),
                    type: 'rocket'
                };
                rocket.rotation.copy(modelContainer.rotation);
            }       
            scene.add(rocket);
            projectiles.push(rocket);
        }
     availableRockets--;
        updateRocketIcons();
    }
}

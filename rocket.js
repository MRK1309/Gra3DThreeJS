import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let availableRockets = 2;

const loader = new GLTFLoader();
const rocketContainer = new THREE.Object3D();

loader.load('/rakieta.glb', function (gltf) {
    const rocketModel = gltf.scene;
    rocketModel.rotation.y = Math.PI;

    rocketContainer.add(rocketModel);
});

function updateRocketIcons() {
    const rocket2 = document.getElementById('rocket2');
    const rocket1 = document.getElementById('rocket1');

    if (availableRockets === 1) {
        rocket2.src = "rocket_locked.png";
    } else if (availableRockets === 0) {
        rocket1.src = "rocket_locked.png";
    }
}

export function fireRocket(scene, playerModel, opponents, projectiles) {
    const activeRockets = projectiles.filter(projectile => projectile.userData.type === 'rocket');
    if (availableRockets > 0) {
        if (activeRockets.length >= 2) return;

        if (rocketContainer) {
            const rocket = rocketContainer.clone();
            rocket.position.copy(playerModel.position);
            rocket.scale.set(0.25, 0.25, 0.25);

            let closestOpponent = null;
            let closestDistance = Infinity;

            // Znajdź najbliższego przeciwnika
            opponents.forEach(opponent => {
                if (scene.children.includes(opponent.model)) {
                    const distance = rocket.position.distanceTo(opponent.model.position);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestOpponent = opponent;
                    }
                }
            });

            if (closestOpponent) {
                const directionToOpponent = new THREE.Vector3()
                    .subVectors(closestOpponent.model.position, rocket.position)
                    .normalize();
                rocket.userData = {
                    velocity: directionToOpponent.multiplyScalar(0.5),
                    type: 'rocket'
                };
                rocket.lookAt(closestOpponent.model.position);
            } else {
                // Jeśli brak przeciwników, rakieta leci do przodu
                rocket.userData = {
                    velocity: new THREE.Vector3(0, 0, -1)
                        .applyQuaternion(playerModel.quaternion)
                        .multiplyScalar(0.5),
                    type: 'rocket'
                };
                rocket.rotation.copy(playerModel.rotation);
            }

            scene.add(rocket);
            projectiles.push(rocket);
        }

        availableRockets--;
        updateRocketIcons();
    }
}

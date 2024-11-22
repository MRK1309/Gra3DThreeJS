import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Zmienna przechowująca liczbę dostępnych rakiet
let availableRockets = 2;

// Wczytanie modelu rakiety
const loader = new GLTFLoader();
const rocketContainer = new THREE.Object3D();

loader.load('/rakieta.glb', function (gltf) {
    const rocketModel = gltf.scene;
    rocketModel.rotation.y = Math.PI

    rocketContainer.add(rocketModel)
});

// Funkcja aktualizująca widoczność ikon rakiet
function updateRocketIcons() {
    const rocket2 = document.getElementById('rocket2')
    const rocket1 = document.getElementById('rocket1')

    if (availableRockets === 1) {
        rocket2.src = "rocket_locked.png"
    } else if (availableRockets === 0) {
        rocket1.src = "rocket_locked.png"
    }
}

// Funkcja wystrzelenia rakiety
export function fireRocket(scene, modelContainer, opponentModelContainer, projectiles) {
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

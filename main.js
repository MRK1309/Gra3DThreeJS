import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { setupInterface, updateBars } from './interface';
import { createSky, createWater } from './environment';
import { fireProjectile, opponentFire } from './projectile';
import { dodge, setupControls, getControlStates } from './controls';
import { fireRocket} from './rocket';
import { opponentFollow, opponentGetHit, checkHit } from './opponent';
import { gameOver } from './gameover';

// Przygotowanie sceny
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

camera.position.z = 13;
camera.position.y = 5;

const modelContainer = new THREE.Object3D();
const controls = new PointerLockControls(modelContainer, renderer.domElement);
modelContainer.attach(camera);

controls.addEventListener('change', () => {
    const euler = new THREE.Euler(0, controls.object.rotation.y, 0, 'YXZ');
    controls.object.rotation.copy(euler);
});


// GLTFLoader - załadowanie modelu samolotu
let myModel = new THREE.Object3D();
const loader = new GLTFLoader();
loader.load('/samolot.glb', function (gltf) {
    myModel = gltf.scene;
    modelContainer.add(myModel);
});
scene.add(modelContainer);
let playerBoundingBox = new THREE.Box3();

// Przeciwnik
const opponentModelContainer = new THREE.Object3D();
let opponentModel = new THREE.Object3D();
let opponentHitCount = 0;
let opponentBoundingBox = new THREE.Box3();

loader.load('/samolot_przeciwnik.glb', function (gltf) {
    opponentModel = gltf.scene;
    opponentModel.rotation.y = Math.PI
    opponentModelContainer.add(opponentModel);
    opponentModelContainer.position.z = modelContainer.position.z - 50;
    opponentBoundingBox.setFromObject(opponentModelContainer);
});
scene.add(opponentModelContainer);

// Rakieta
const rocketContainer = new THREE.Object3D();
let rocketModel = new THREE.Object3D();
loader.load('/rakieta.glb', function (gltf) {
    rocketModel = gltf.scene;
    rocketModel.rotation.y = Math.PI
    rocketContainer.add(rocketModel)
});

// Baaardzo wstępny obiekt uderzenia
const geometry = new THREE.CircleGeometry(1, 32);
const material = new THREE.MeshBasicMaterial({color: 0xffff00});
const material2 = new THREE.MeshBasicMaterial({color: 0xed0909});

const hit = new THREE.Mesh(geometry, material);
const opponentHit = new THREE.Mesh(geometry, material2);

function getHit(){
    hit.position.copy(modelContainer.position);
    hit.rotation.copy(modelContainer.rotation);
    scene.add(hit);
}

// Zmienne gry
const projectiles = [];
const speed = 0.125;
const opponentProjectiles = [];
let health = 20;
let fuel = 100;
let shootCount = 40;
let reloaded = true;

// Sterowanie (controls.js)
setupControls();
setupInterface(controls)

// Funkcja przeładowania
export function reload() {
    const interval = setInterval(() => {
        if (shootCount != 40 && controls.isLocked)
            shootCount++;

        if (shootCount == 40)
            clearInterval(interval);
    }, 100);
}

//Zmniejszanie paliwa
setInterval(() => {
    if (fuel > 0 && controls.isLocked) {
        fuel--;
    }
}, 1000);


function animate() {
    if (controls.isLocked) {
        const { forward, right, left, fire, rocket } = getControlStates();

        controls.moveForward(speed);
        if (forward) {
            controls.moveForward(speed * 2);
            fuel -= 0.1; // Szybsze zużycie paliwa
        }
        if (right) dodge(speed * 2, controls);
        if (left) dodge(-speed * 2, controls);
        if (fire) {
            if (shootCount > 0 && reloaded == true) {
                fireProjectile(scene, modelContainer, projectiles);
                shootCount--;
            } else if (shootCount == 0) {
                reloaded = false;
                reload();
            } else if (shootCount == 40) reloaded = true;
        }
        if (rocket) fireRocket(scene, rocketContainer, modelContainer, opponentModelContainer, projectiles);

        playerBoundingBox.setFromObject(modelContainer);
        opponentBoundingBox.setFromObject(opponentModelContainer);

        // Aktualizacja wszelkich pasków
        updateBars(shootCount, fuel, health);

        // Zakończenie gry (brak paliwa lub zdrowia)
        if (fuel <= 0 || health <= 0) {
            controls.unlock();
            gameOver(scene, modelContainer, opponentModelContainer, renderer);
            return;
        }

        // Aktualizacja pocisków i kolizji
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            projectile.position.add(projectile.userData.velocity);

            if (scene.children.includes(opponentModelContainer)) {
                if (opponentBoundingBox.containsPoint(projectile.position)) {
                    opponentGetHit(opponentModelContainer, modelContainer, scene);

                    if (projectile.userData.type === 'rocket') {
                        opponentHitCount += 5;
                    } else {
                        opponentHitCount++;
                    }

                    scene.remove(projectile);
                    projectiles.splice(i, 1);

                    if (opponentHitCount >= 10) {
                        scene.remove(opponentModelContainer);
                    }
                    continue;
                }
            }

            scene.remove(opponentHit);

            if (projectile.position.distanceTo(modelContainer.position) > 100) {
                scene.remove(projectile);
                projectiles.splice(i, 1);
            }
        }

        // Przeciwnik
        opponentFollow(opponentModelContainer, modelContainer);

        if (scene.children.includes(opponentModelContainer)) {
            if (opponentModelContainer.position.distanceTo(modelContainer.position) < 50 && opponentModelContainer.position.distanceTo(modelContainer.position) > 20)
                opponentFire(scene, opponentModelContainer, opponentProjectiles);
        }

        for (let i = opponentProjectiles.length - 1; i >= 0; i--) {
            const oprojectile = opponentProjectiles[i];
            oprojectile.position.add(oprojectile.userData.velocity);

            if (playerBoundingBox.containsPoint(oprojectile.position)) {
                getHit();

                health--;

                scene.remove(oprojectile);
                opponentProjectiles.splice(i, 1);

                if (health < 0) {
                    scene.remove(modelContainer); // Testowe usunięcie samolotu
                }
                continue;
            }

            scene.remove(hit);

            if (oprojectile.position.distanceTo(modelContainer.position) > 100) {
                scene.remove(oprojectile);
                opponentProjectiles.splice(i, 1);
            }
        }

        if (hit.position.distanceTo(modelContainer.position) > 1) {
            scene.remove(hit);
        }
        checkHit(opponentModelContainer, scene);

        // Kolizja
        if (scene.children.includes(opponentModelContainer)) {
            if (playerBoundingBox.containsPoint(opponentModelContainer.position)) {
                opponentGetHit(opponentModelContainer, modelContainer, scene);
                getHit();

                scene.remove(modelContainer); // Testowe usunięcie samolotu
                scene.remove(opponentModelContainer);
            }
        }

        water.material.uniforms['time'].value += 1.0 / 60.0;
    }
    renderer.render(scene, camera);
}



// Woda
const water = createWater();
scene.add(water);

// Niebo i światło
const sky = createSky();
scene.add(sky);

const ambientLight = new THREE.AmbientLight(0xffffff, 100);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

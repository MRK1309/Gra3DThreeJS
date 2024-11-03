import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { createSky } from './sky';
import { fireProjectile } from './projectile';
import { setupControls, getControlStates } from './controls';

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

// GLTFLoader - załadowanie modelu samolotu
let myModel = new THREE.Object3D();
const loader = new GLTFLoader();
loader.load('/samolot.glb', function (gltf) {
    myModel = gltf.scene;
    modelContainer.add(myModel);
});
scene.add(modelContainer);

// Przeciwnik
const opponentModelContainer = new THREE.Object3D();
let opponentModel = new THREE.Object3D();
let opponentHitCount = 0;
let opponentBoundingBox = new THREE.Box3();

loader.load('/samolot.glb', function (gltf) {
    opponentModel = gltf.scene;
    opponentModelContainer.add(opponentModel);
    opponentModelContainer.position.z = modelContainer.position.z - 50;
    opponentModelContainer.rotation.y = Math.PI;
    opponentBoundingBox.setFromObject(opponentModelContainer);
});
scene.add(opponentModelContainer);

// Rakieta
let rocketModel;
loader.load('/rakieta.glb', function (gltf) {
    rocketModel = gltf.scene;
});

// Funkcja wystrzelenia rakiety
function fireRocket() {
    if (rocketModel) {
        const rocket = rocketModel.clone();
        rocket.position.copy(modelContainer.position);
        rocket.rotation.copy(modelContainer.rotation);
        
        rocket.userData.velocity = new THREE.Vector3(0, 0, -1).applyQuaternion(modelContainer.quaternion).multiplyScalar(0.5);
        
        scene.add(rocket);
        projectiles.push(rocket);
    }
}

// Dodanie event listenera na klawisz Shift
document.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') {
        fireRocket();
    }
});

// Zmienne gry
const projectiles = [];
const speed = 0.125;

// Sterowanie (controls.js)
setupControls();

// UI
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');

document.body.addEventListener('click', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
    controls.lock();
}, false);

controls.addEventListener('unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
});

controls.addEventListener('change', () => {
    const euler = new THREE.Euler(0, controls.object.rotation.y, 0, 'YXZ');
    controls.object.rotation.copy(euler);
});

// Funkcja uniku
function dodge(speed) {
    const duration = 500;
    const startTime = Date.now();

    const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        
        controls.moveRight(speed);

        if (elapsedTime >= duration) {
            clearInterval(interval); // Zatrzymaj interwał
        }
    }, 1);
}

// Główna funkcja animacji
function animate() {
    if (controls.isLocked) {
        const { forward, right, left, fire } = getControlStates();

        controls.moveForward(speed);
        if (forward) controls.moveForward(speed*2);
        if (right) dodge(speed * 2);
        if (left) dodge(-speed * 2);
        if (fire) fireProjectile(scene, modelContainer, projectiles);

        opponentBoundingBox.setFromObject(opponentModelContainer);

        // Aktualizacja pocisków i kolizji
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            projectile.position.add(projectile.userData.velocity);

            if (opponentBoundingBox.containsPoint(projectile.position)) {
                opponentHitCount++;
                scene.remove(projectile);
                projectiles.splice(i, 1);

                if (opponentHitCount >= 10) {
                    scene.remove(opponentModelContainer);
                }
                continue;
            }

            if (projectile.position.distanceTo(modelContainer.position) > 100) {
                scene.remove(projectile);
                projectiles.splice(i, 1);
            }
        }
    }
    renderer.render(scene, camera);
}

// Niebo i światło
const sky = createSky();
scene.add(sky);

const ambientLight = new THREE.AmbientLight(0xffffff, 100);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 30);
spotLight.position.set(0, 15, 5);
spotLight.target.position.set(0, 0, 0);
scene.add(spotLight);
scene.add(spotLight.target);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

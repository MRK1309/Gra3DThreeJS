import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { createSky } from './sky';
import { fireProjectile, opponentFire } from './projectile';
import { dodge, setupControls, getControlStates } from './controls';
import { fireRocket } from './rocket';
import { opponentFollow } from './opponent';

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
let playerBoundingBox = new THREE.Box3();
let health = 20;

// Przeciwnik
const opponentModelContainer = new THREE.Object3D();
let opponentModel = new THREE.Object3D();
let opponentHitCount = 0;
let opponentRocketHitCount = 0;
let opponentBoundingBox = new THREE.Box3();

loader.load('/samolot.glb', function (gltf) {
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

// Zmienne gry
const projectiles = [];
const speed = 0.125;
const opponentProjectiles = [];

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

// Baaardzo wstępny obiekt uderzenia
const geometry = new THREE.CircleGeometry(1, 32);
const material = new THREE.MeshBasicMaterial({color: 0xffff00});
const hit = new THREE.Mesh(geometry, material);

// Główna funkcja animacji
function animate() {
    if (controls.isLocked) {
        const { forward, right, left, fire, rocket } = getControlStates();

        controls.moveForward(speed);
        if (forward) controls.moveForward(speed*2);
        if (right) dodge(speed * 2, controls);
        if (left) dodge(-speed * 2, controls);
        if (fire) fireProjectile(scene, modelContainer, projectiles);
        if (rocket) fireRocket(scene, rocketContainer, modelContainer, opponentModelContainer, projectiles);

        playerBoundingBox.setFromObject(modelContainer);
        opponentBoundingBox.setFromObject(opponentModelContainer);

        // Aktualizacja pocisków i kolizji
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            projectile.position.add(projectile.userData.velocity);

            if(scene.children.includes(opponentModelContainer)){
                if (opponentBoundingBox.containsPoint(projectile.position)) {
                    if (projectile.userData.type === 'rocket') {
                        opponentRocketHitCount++; 
                    } else {
                        opponentHitCount++;
                    }

                    scene.remove(projectile);
                    projectiles.splice(i, 1);

                    if (opponentHitCount >= 10 || opponentRocketHitCount >= 2) {
                        scene.remove(opponentModelContainer);
                    }
                    continue;
                }
            }

            if (projectile.position.distanceTo(modelContainer.position) > 100) {
                scene.remove(projectile);
                projectiles.splice(i, 1);
            }
        }

        //przeciwnik
        opponentFollow(opponentModelContainer, modelContainer)

        if(scene.children.includes(opponentModelContainer)){
            if(opponentModelContainer.position.distanceTo(modelContainer.position) < 50 && opponentModelContainer.position.distanceTo(modelContainer.position) > 20)
                opponentFire(scene, opponentModelContainer, opponentProjectiles)
        }

        for (let i = opponentProjectiles.length - 1; i >= 0; i--) {
            const oprojectile = opponentProjectiles[i];
            oprojectile.position.add(oprojectile.userData.velocity);

            if (playerBoundingBox.containsPoint(oprojectile.position)) {
                hit.position.copy(modelContainer.position)
                hit.rotation.copy(modelContainer.rotation)
                scene.add(hit);

                health--;
                console.log(health)

                scene.remove(oprojectile);
                opponentProjectiles.splice(i, 1);

                if (health < 0) {
                    scene.remove(modelContainer); //to tak na razie dla testów xd
                }
                continue;
            }

            scene.remove(hit)

            if (oprojectile.position.distanceTo(modelContainer.position) > 100) {
                scene.remove(oprojectile);
                opponentProjectiles.splice(i, 1);
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

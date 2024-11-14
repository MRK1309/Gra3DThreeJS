import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { createSky, createWater } from './environment';
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
let health = 20;
let fuel = 100;
let shootCount = 40;

// Sterowanie (controls.js)
setupControls();

// UI
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
//Pasek życia
const healthBar = document.getElementById('health-bar');
const healthBarContainer = document.getElementById('health-bar-container');
//Paliwo
const fuelBar = document.getElementById('fuel-bar');
const fuelBarContainer = document.getElementById('fuel-bar-container');
//Pociski
const shootBar = document.getElementById('shoot-bar');
const shootBarContainer = document.getElementById('shoot-bar-container');
//Rakiety
const rocketIcons = document.getElementById('rocket-icons');
const rocket1 = document.getElementById('rocket1');
const rocket2 = document.getElementById('rocket2');


document.body.addEventListener('click', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
    healthBar.style.display = 'block'
    healthBarContainer.style.display = 'block'
    fuelBar.style.display = 'block'
    fuelBarContainer.style.display = 'block'
    shootBar.style.display = 'block'
    shootBarContainer.style.display = 'block'
    rocketIcons.style.display = 'block'
    rocket1.style.display = 'block'
    rocket2.style.display = 'block'
    controls.lock();
}, false);

controls.addEventListener('unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
    healthBar.style.display = 'none'
    healthBarContainer.style.display = 'none'
    fuelBar.style.display = 'none'
    fuelBarContainer.style.display = 'none'
    shootBar.style.display = 'none'
    shootBarContainer.style.display = 'none'
    rocketIcons.style.display = 'none'
    rocket1.style.display = 'none'
    rocket1.style.display = 'none'
});


controls.addEventListener('change', () => {
    const euler = new THREE.Euler(0, controls.object.rotation.y, 0, 'YXZ');
    controls.object.rotation.copy(euler);
});


// Baaardzo wstępny obiekt uderzenia
const geometry = new THREE.CircleGeometry(1, 32);
const material = new THREE.MeshBasicMaterial({color: 0xffff00});
const hit = new THREE.Mesh(geometry, material);

//Aktualziacja strzelania
function updateShootBar() {
    if (shootCount > 0) {
        shootCount--; // Zmniejszenie ładunku
        const shootPercentage = Math.max((shootCount / 40) * 100, 0);
        shootBar.style.width = `${shootPercentage}%`; // Zmiana szerokości paska strzelania
    }
}

//Zmniejszanie paliwa
setInterval(() => {
    if (fuel > 0) {
        fuel--;
    }
}, 1000);

// Główna funkcja animacji
function animate() {
    if (controls.isLocked) {
        const { forward, right, left, fire, rocket } = getControlStates();

        controls.moveForward(speed);
        if (forward) controls.moveForward(speed * 2);
        if (right) dodge(speed * 2, controls);
        if (left) dodge(-speed * 2, controls);
        if (fire) {
            fireProjectile(scene, modelContainer, projectiles);
            updateShootBar(); // Aktualizacja paska strzelania
        }
        if (rocket) fireRocket(scene, rocketContainer, modelContainer, opponentModelContainer, projectiles);
        
        playerBoundingBox.setFromObject(modelContainer);
        opponentBoundingBox.setFromObject(opponentModelContainer);

        // Aktualizacja paska paliwa
        const fuelPercentage = Math.max((fuel / 100) * 100, 0);
        fuelBar.style.width = `${fuelPercentage}%`;

        // Aktualizacja pocisków i kolizji
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            projectile.position.add(projectile.userData.velocity);

            if (scene.children.includes(opponentModelContainer)) {
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
                hit.position.copy(modelContainer.position);
                hit.rotation.copy(modelContainer.rotation);
                scene.add(hit);

                health--;

                // Aktualizacja paska życia
                const healthPercentage = Math.max((health / 20) * 100, 0);
                healthBar.style.width = `${healthPercentage}%`;

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

const spotLight = new THREE.SpotLight(0xffffff, 30);
spotLight.position.set(0, 15, 5);
spotLight.target.position.set(0, 0, 0);
scene.add(spotLight);
scene.add(spotLight.target);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

// const gridHelper = new THREE.GridHelper(100, 100);
// scene.add(gridHelper);
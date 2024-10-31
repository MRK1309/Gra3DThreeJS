import * as THREE from 'three'; 
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { createSky } from './sky';
import { fireProjectile } from './projectile';

// Przygotowanie sceny
const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); 
const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(window.innerWidth, window.innerHeight); 
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement); 
camera.position.z = 13; camera.position.y = 5; 
const modelContainer = new THREE.Object3D();
const controls = new PointerLockControls(modelContainer, renderer.domElement);
modelContainer.attach(camera);

// Obsługa zdarzeń
controls.addEventListener('change', () => {
    const euler = new THREE.Euler(0, controls.object.rotation.y, 0, 'YXZ');
    controls.object.rotation.copy(euler);});
document.body.addEventListener('click', function (){
    instructions.style.display = 'none';
	blocker.style.display = 'none';
    controls.lock(); }, false);
controls.addEventListener( 'unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';});
const blocker = document.getElementById( 'blocker' );
const instructions = document.getElementById( 'instructions' );
document.addEventListener("keydown", onDocumentKeyDown, false);
document.addEventListener("keyup", onDocumentKeyUp, false);

// GLTFLoader - załadowanie modeli
const loader = new GLTFLoader();
loader.load('/samolot.glb', function(gltf) {
    modelContainer.add(gltf.scene);
});
scene.add(modelContainer);

const opponentModelContainer = new THREE.Object3D();
loader.load('/samolot.glb', function(gltf) {
    opponentModelContainer.add(gltf.scene);
    opponentModelContainer.position.z = modelContainer.position.z - 50;
    opponentModelContainer.rotation.y = Math.PI;
});
scene.add(opponentModelContainer);

// Zmienne
const projectiles = [];
const speed = 0.125; 
let forward = false; let right = false; let left = false; let fire = false;
const cooldownTime = 5000; let lastTurnTime = 0; 
let opponentHitCount = 0;

// Główna pętla animacji
function animate() {
    if (controls.isLocked) {
        controls.moveForward(speed/2);
        if (forward) {
            controls.moveForward(speed);
        }

        if (right){
            controls.moveRight(speed*2);
        }

        if (left) {
            controls.moveRight(-speed*2);
        }

        if(fire){
            fireProjectile(scene, modelContainer, projectiles);
        }

        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            
            projectile.position.add(projectile.userData.velocity);

            if (projectile.position.distanceTo(opponentModelContainer.position) < 1) {
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

// Kontrola klawiszy
function onDocumentKeyDown(event) {
    const keyCode = event.which;

    if (keyCode === 87) { // W
        forward = true;
    } 

    if (keyCode === 68) { // D
        const currentTime = Date.now();
        if (currentTime - lastTurnTime > cooldownTime) {
            right = true 
            lastTurnTime = currentTime; 
        }
    } 
    if (keyCode === 65) { // D
        const currentTime = Date.now();
        if (currentTime - lastTurnTime > cooldownTime) {
            left = true 
            lastTurnTime = currentTime;
        }
    }
    if (event.code === "Space") {
        fire = true
    } 
}

function onDocumentKeyUp(event) {
    const keyCode = event.which;
    if (keyCode === 87) { // W
        forward = false;
    }
    if (keyCode === 68) { // D
        right = false;
        lastTurnTime = currentTime; 
    }
    if (keyCode === 65) { // A
        left = false;
        lastTurnTime = currentTime; 
    }
    if (event.code === "Space") {
        fire = false;
    } 
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

// Pomocnicza siatka
const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

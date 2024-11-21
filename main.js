import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { setupInterface, updateBars } from './interface';
import { createSky, createWater } from './environment';
import { fireProjectile, opponentFire } from './projectile';
import { dodge, setupControls, getControlStates } from './controls';
import { fireRocket} from './rocket';
import { addOpponent } from './opponent';
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

//Przeciwnik
const opp = addOpponent()
const opp2 = addOpponent()
const opponents = [opp, opp2]

let position = 0
for (let i = 0; i < opponents.length; i++) {
    const opponent = opponents[i];

    opponent.loadModel()
    opponent.model.position.x += position
    scene.add(opponent.model);

    position += 50
}


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
const hit = new THREE.Mesh(geometry, material);


function getHit(){
    hit.position.copy(modelContainer.position);
    hit.rotation.copy(modelContainer.rotation);
    scene.add(hit);
}

// Zmienne gry
const projectiles = [];
const speed = 0.125;

let health = 20;
let fuel = 1000;
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

function findNearest(){
    let minDistance = opponents[0].model.position.distanceTo(modelContainer.position)
    let nearest = opponents[0];
    opponents.forEach(opponent => {
        if(opponent.model.position.distanceTo(modelContainer.position) < minDistance){
            minDistance = opponent.model.position.distanceTo(modelContainer.position)
            nearest = opponent
        }
    });

    return nearest.model;
}

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
        

        if (rocket) fireRocket(scene, rocketContainer, modelContainer, findNearest(), projectiles);

        playerBoundingBox.setFromObject(modelContainer);
        opponents.forEach(opponent => {
            opponent.boundingBox.setFromObject(opponent.model);
            opponent.updateHealthBar();
            opponent.updateHealthBarOrientation(camera);
        });

        // Aktualizacja wszelkich pasków
        updateBars(shootCount, fuel, health);
        
        // Zakończenie gry (brak paliwa lub zdrowia)
        if (fuel <= 0 || health <= 0) {
            controls.unlock();
            gameOver(scene, modelContainer, renderer);
            return;
        }

        // Aktualizacja pocisków i kolizji
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            projectile.position.add(projectile.userData.velocity);

            for (let j = 0; j < opponents.length; j++) {
                const opponent = opponents[j];

                if (scene.children.includes(opponent.model)) {
                    if (opponent.boundingBox.containsPoint(projectile.position)) {
                        opponent.getHit(modelContainer, scene);

                        if (projectile.userData.type === 'rocket') {
                            opponent.health -= 5;
                        } else {
                            opponent.health--;
                        }

                        scene.remove(projectile);
                        projectiles.splice(i, 1);

                        if (opponent.health <= 0) {
                            scene.remove(opponent.model);
                        }
                        continue;
                    }
                }
            }   
            
            if (projectile.position.distanceTo(modelContainer.position) > 100) {
                scene.remove(projectile);
                projectiles.splice(i, 1);
            }
        }

        // Przeciwnik
        opponents.forEach(opponent => {
            opponent.follow(modelContainer)
            if (scene.children.includes(opponent.model)) {
                if (opponent.model.position.distanceTo(modelContainer.position) < 50 && opponent.model.position.distanceTo(modelContainer.position) > 20)
                    opponentFire(scene, opponent.model, opponent.projectiles);
            }

            for (let i = opponent.projectiles.length - 1; i >= 0; i--) {
                const oprojectile = opponent.projectiles[i];
                oprojectile.position.add(oprojectile.userData.velocity);
    
                if (playerBoundingBox.containsPoint(oprojectile.position)) {
                    getHit();
    
                    health--;
    
                    scene.remove(oprojectile);
                    opponent.projectiles.splice(i, 1);
    
                    if (health < 0) {
                        scene.remove(modelContainer); // Testowe usunięcie samolotu
                    }
                    continue;
                }
    
                scene.remove(hit);
    
                if (oprojectile.position.distanceTo(modelContainer.position) > 100) {
                    scene.remove(oprojectile);
                    opponent.projectiles.splice(i, 1);
                }
            }
            opponent.checkHit(scene);

            // Kolizja
            if (scene.children.includes(opponent.model)) {
                if (playerBoundingBox.containsPoint(opponent.model.position)) {
                    opponent.getHit(modelContainer, scene);
                    getHit();

                    scene.remove(opponent.model);
                    health = 0;
                }
            }
        });

        if (hit.position.distanceTo(modelContainer.position) > 1) {
            scene.remove(hit);
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

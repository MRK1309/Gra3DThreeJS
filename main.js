import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { setupInterface, updateBars } from './interface';
import { createLight, createSky, createWater } from './environment';
import { setupControls } from './controls';
import { addPlayer } from './player';
import { addOpponent } from './opponent';
import { gameOver } from './gameover';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Przygotowanie sceny
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Model gracza
const player = addPlayer()
player.loadModel()
scene.add(player.model);

// Kamera
const controls = new PointerLockControls(player.model, renderer.domElement);
player.model.attach(camera);

camera.position.z = 13;
camera.position.y = 5;

controls.addEventListener('change', () => {
    const euler = new THREE.Euler(0, controls.object.rotation.y, 0, 'YXZ');
    controls.object.rotation.copy(euler);
});

// Przeciwnicy
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

// Sterowanie (controls.js)
setupControls();

// Elementy interfejsu
setupInterface(controls)

//Zmniejszanie paliwa
player.fuelConsume(controls);

function animate() {
    if (controls.isLocked) {
        // Obsługa sterowania
        player.useControls(controls, scene, opponents)

        // Aktualizacja hitboxu gracza
        player.boundingBox.setFromObject(player.model);

        // Aktualizacja wszelkich pasków
        updateBars(player.shootCount, player.fuel, player.health);

        // Aktualizacja pocisków i kolizji
        player.updateCollision(opponents, scene)

        // Zakończenie gry (brak paliwa lub zdrowia)
        if (player.fuel <= 0 || player.health <= 0) {
            controls.unlock();
            gameOver(scene, player.model, renderer);
            return;
        }

        opponents.forEach(opponent => {
            // Aktualizacja hitboxów przeciwników
            opponent.boundingBox.setFromObject(opponent.model);

            // Aktualizacja pasków życia przeciwników
            opponent.updateHealthBar();
            opponent.updateHealthBarOrientation(camera);

            // Poruszanie się przeciwników
            opponent.follow(player.model)

            // Aktualizacja pocisków i kolizji przeciwnika
            opponent.updateCollision(player, scene)

            // Sprawdzanie czy model został trafiony (przyszłe animacje)
            player.checkHit(scene);
            opponent.checkHit(scene);

            if (scene.children.includes(opponent.model)) {
                // Strzelanie przeciwnika
                if (opponent.model.position.distanceTo(player.model.position) < 50 && opponent.model.position.distanceTo(player.model.position) > 20)
                    opponent.fireProjectile(scene);

                // Kolizja przeciwnika z graczem
                if (player.boundingBox.containsPoint(opponent.model.position)) {
                    opponent.getHit(player.model, scene);
                    player.getHit(scene);

                    scene.remove(opponent.model);
                    player.health = 0;
                }
            }
        });
        // Animacja wody
        water.material.uniforms['time'].value += 1.0 / 60.0;
    }
    renderer.render(scene, camera);
}

// Woda
const mapContainer = new THREE.Object3D();
scene.add(mapContainer);

const water = createWater();
mapContainer.add(water);

// Niebo
const sky = createSky();
scene.add(sky);

// Światło
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = createLight();
scene.add(directionalLight);

// Mapa

let wyspa = new THREE.Object3D();
mapContainer.add(wyspa);

const loader = new GLTFLoader();
loader.load('/mapa.glb', function (gltf) {
    wyspa.add(gltf.scene);
});

wyspa.position.y = -20;

//oś x - prawo lewo
// oś y - góra dół
//oś z - przód tył

mapContainer.position.y -= 10;


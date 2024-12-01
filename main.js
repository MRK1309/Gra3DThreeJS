import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { setupInterface, updateBars, updateRocketIcons } from './interface';
import { createGround, createLight, createSky, createWater } from './environment';
import { setupControls } from './controls';
import { addPlayer } from './player';
import { addOpponent, createOpponents } from './opponent';
import { currentLevel, gameOver, levelCompleted } from './levelCompleted';
import { setupRadar, updateRadar } from './radar';


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

let current = 0;
let levels = currentLevel()
let level = levels[current]


// Przeciwnicy
const opponents = [];
let numberOfOpponents = level.numberOfOpponents;

// const opponent1 = addOpponent()
// opponent1.loadModel()
// opponent1.model.position.z = (Math.random() - 0.5) * 300
// opponent1.model.position.x = (Math.random() - 0.5) * 300
// opponents.push(opponent1)
// scene.add(opponent1.model)

createOpponents(numberOfOpponents, opponents, player, controls, scene, 5000)

// Sterowanie (controls.js);
setupControls();

// Elementy interfejsu
setupInterface(controls)

// Tworzenie radaru
const { radarContext, radarSize } = setupRadar();

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

        // Aktualizacja ikonek rakiet
        updateRocketIcons(player.availableRockets)

        // Aktualizacja radaru
        updateRadar(player, opponents, radarContext, radarSize);

        // Aktualizacja pocisków i kolizji
        player.updateCollision(opponents, scene)

        // Zakończenie gry (brak paliwa lub zdrowia)
        if (player.fuel <= 0 || player.health <= 0) {
            controls.unlock();
            gameOver(scene, player.model, renderer);
            return;
        }

        // Zaktualizuj przeciwników
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

            // Omijanie innych przeciwników
            opponent.avoidOtherOpponents(opponents);

            // Sprawdzanie czy model został trafiony (przyszłe animacje)
            player.checkHit(scene);
            opponent.checkHit(scene);
            
            if (scene.children.includes(opponent.model)) {
                // Strzelanie przeciwnika
                if (opponent.model.position.distanceTo(player.model.position) < 80 && opponent.model.position.distanceTo(player.model.position) > 20)
                    opponent.fireProjectile(scene);

                // Kolizja przeciwnika z graczem
                if (player.boundingBox.containsPoint(opponent.model.position)) {
                    opponent.getHit(player.model, scene);
                    player.getHit(scene);

                    scene.remove(opponent.model);
                    player.health = 0;
                }
            }
            // Zliczanie zniszczonych przeciwników
            if (opponent.health <= 0 && !opponent.isDestroyed) {
                level.destroyedOpponents += 1;
                opponent.isDestroyed = true;
                console.log(level.destroyedOpponents);
            }
        });
        // Przejście poziomu
        if (level.destroyedOpponents>=numberOfOpponents) {
            player.model.position.set(0, 0, 0)
            player.model.rotation.set(0, 0, 0)
            current++;
            if(current >= levels.length){
                controls.unlock();
                gameOver(scene, player.model, renderer); // tymczasowo
                return;
            }else{
                level = levels[current]
                numberOfOpponents = level.numberOfOpponents
                createOpponents(numberOfOpponents, opponents, player, controls, scene, 4500, level.damage)

                scene.remove(player.hit)
                player.projectiles.forEach(projectile => {
                    scene.remove(projectile)
                });

                opponents.forEach(opponent => {
                    opponent.projectiles.forEach(projectile => {
                        scene.remove(projectile)
                    });
                    scene.remove(opponent.hit)
                });

                controls.unlock();
                levelCompleted(scene, player, renderer, controls)
                return;
            }
        }
        const levelCompletedScreen = document.getElementById('level-completed');
        if(levelCompletedScreen.style.display == 'block')
            controls.unlock();
        
        // Animacja wody
        water.material.uniforms['time'].value += 1.0 / 60.0;
    }
    renderer.render(scene, camera);
}

// Mapa
const mapContainer = new THREE.Object3D();
mapContainer.position.y = -50;
scene.add(mapContainer);

// Woda
const water = createWater();
mapContainer.add(water);

// Ziemia
const ground = createGround()
mapContainer.add(ground);

// Niebo
const sky = createSky();
scene.add(sky);

// Światło
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = createLight();
scene.add(directionalLight);

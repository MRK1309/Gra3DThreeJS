import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { setupInterface, updateBars, updateRocketIcons } from './interface';
import { createGround, createLight, createSky, createWater } from './environment';
import { setupControls } from './controls';
import { addPlayer } from './player';
import { createOpponents } from './opponent';
import { getLevels, gameOver, levelCompleted, basePlayer } from './levels';
import { setupRadar, updateRadar } from './radar';
import { addTower } from './tower';



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

// Poziom gry
const levels = getLevels()
let currentLevel = 0;
let level = levels[currentLevel]

// Przeciwnicy
const opponents = [];

// Sterowanie (controls.js);
setupControls();

// Elementy interfejsu
setupInterface(controls)

// Tworzenie radaru
const { radarContext, radarSize } = setupRadar();

//Zmniejszanie paliwa
player.fuelConsume(controls);

// Model wieży 
const tower = addTower();
tower.loadModel()

function animate() {
    if (controls.isLocked) {
        // Rozpoczęcie poziomu
        if(level.started == false){
            level.started = true
            createOpponents(1, opponents, player, controls, scene, 0, level.damage)
            createOpponents(level.numberOfOpponents, opponents, player, controls, scene, level.spawnTime, level.damage)
        }

        if (currentLevel >= 3){
            scene.add(tower.model)

            tower.fireProjectile(scene, player)
            tower.updateCollision(player, scene)
        }

        if (currentLevel == 4){
            scene.fog = new THREE.Fog( 0xcccccc, 10, 150 );
        }

        // Obsługa sterowania
        player.useControls(controls, scene, opponents)

        // Aktualizacja hitboxu gracza
        player.boundingBox.setFromObject(player.model);

        // Aktualizacja wszelkich pasków
        updateBars(player.shootCount, player.fuel, player.health, basePlayer());

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
                if (opponent.model.position.distanceTo(player.model.position) < 80 && opponent.model.position.distanceTo(player.model.position) > 20){
                    if (opponent.type == "standard")
                        opponent.fireProjectile(scene);
                }

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
        if (level.destroyedOpponents>=level.numberOfOpponents+1) {
            currentLevel++;

            if(currentLevel >= levels.length){
                controls.unlock();
                gameOver(scene, player.model, renderer); // tymczasowo
                return;
            }else{
                // Zmiana poziomu na kolejny
                level = levels[currentLevel]

                // Wyświetlenie ekranu ukończenia poziomu i reset właściwości
                levelCompleted(scene, player, renderer, opponents)
                controls.unlock();
                return;
            }
        }

        // Pauza gry, gdy poziom został ukończony
        const levelCompletedScreen = document.getElementById('level-completed');
        const shopScreen = document.getElementById('shop-screen');
        if(levelCompletedScreen.style.display == 'block' || shopScreen.style.display == 'block')
            controls.unlock();
        
        // Animacja wody
        water.material.uniforms['time'].value += 1.0 / 60.0;

        // Miganie przy małej ilości życia
        if (player.health <= 8) {
            blinkIntensity += 0.005 * blinkDirection; // jak szybko miga
            if (blinkIntensity >= 0.4) blinkDirection = -1; // górna granica
            if (blinkIntensity <= 0.1) blinkDirection = 1; // dolna granica

            redOverlayMaterial.opacity = blinkIntensity;
        } else {
            redOverlayMaterial.opacity = 0;
        }
    }
    renderer.render(scene, camera);
}

// Mapa
const mapContainer = new THREE.Object3D();
mapContainer.position.y = -55;
scene.add(mapContainer);

// Woda
const water = createWater();
mapContainer.add(water);

// Ziemia
const ground = createGround()
mapContainer.add(ground);
ground.position.y += 0.185;

// Niebo
const sky = createSky();
scene.add(sky);

// Światło
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = createLight();
scene.add(directionalLight);

// Miganie
const redOverlayGeometry = new THREE.PlaneGeometry(5, 2);
const redOverlayMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0,
});
const redOverlay = new THREE.Mesh(redOverlayGeometry, redOverlayMaterial);
redOverlay.position.z = -1;
camera.add(redOverlay);

let blinkIntensity = 0.1;
let blinkDirection = 1;

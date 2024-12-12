import { createOpponents } from './opponent';
import { addPlayer } from './player';
import { store } from './store';
import { addTower } from './tower';

const levelCompletedScreen = document.getElementById('level-completed');
const shopScreen = document.getElementById('shop-screen');
const gameOverScreen = document.getElementById('gameover');
const gameCompletedScreen = document.getElementById('game-completed');

const nextLevelButton = document.getElementById('nextLevelButton');
const shopButton = document.getElementById('shop');
const restartButton = document.getElementById('restartButton');
const menuButton = document.getElementById('menu');

const newElement = document.getElementById('new');

let spawnInterval;
const base = addPlayer()
const tower = addTower();
tower.loadModel()

// Lista poziomów gry
export function getLevels(){
    const levels = [
        {   // 1
            numberOfOpponents: 4,
            destroyedOpponents: 0,
            spawnTime: 5000,
            damage: 1,
            started: false
        },
        {   // 2
            numberOfOpponents: 6,
            destroyedOpponents: 0,
            spawnTime: 4500,
            damage: 1,
            started: false
        },
        {   // 3
            numberOfOpponents: 6,
            destroyedOpponents: 0,
            spawnTime: 4500,
            damage: 2,
            started: false
        },
        {   // 4
            numberOfOpponents: 6,
            destroyedOpponents: 0,
            spawnTime: 4500,
            damage: 2,
            started: false
        },
        {   // 5
            numberOfOpponents: 7,
            destroyedOpponents: 0,
            spawnTime: 4500,
            damage: 2,
            started: false
        },
    ];

    return levels;
}

export function handleLevels(level, currentLevel, player, opponents, controls, scene){
    // Rozpoczęcie poziomu
    if(level.started == false){
        level.started = true
        createOpponents(1, opponents, player, controls, scene, 0, level.damage)
        spawnInterval = createOpponents(level.numberOfOpponents, opponents, player, controls, scene, level.spawnTime, level.damage)

        // Wyświetlenie informacji o zmianach w poziomie
        if (controls.isLocked){
            const cooldownStartTime = Date.now();
            const infoInterval = setInterval(() => {
                const elapsedCooldown = Date.now() - cooldownStartTime;
                
                if (currentLevel == 3)
                    newElement.textContent = `Nowe zagrożenie: wieża. Niemożliwa do zniszczenia.`;
                if (currentLevel == 4)
                    newElement.textContent = `Nowy typ przeciwnika: kamikaze`;

                if (elapsedCooldown >= 5000) {
                    clearInterval(infoInterval);
                    newElement.textContent = ``;
                }
                if (!controls.isLocked)
                    newElement.textContent = ``;
            }); 
        }
    }

    // Dodanie wieży od 4 poziomu
    if (currentLevel >= 3){
        scene.add(tower.model)

        tower.fireProjectile(scene, player)
        tower.updateCollision(player, scene)
    }

    // Dodanie mgły w 5 poziomie
    if (currentLevel == 4){
        // scene.fog = new THREE.Fog( 0xcccccc, 10, 150 );
    }
}

// Funkcja czyszcząca mapę itd.
function cleanLevel(player, opponents, scene){
    player.model.position.set(0, 0, 0)
    player.model.rotation.set(0, 0, 0)

    player.health = base.health
    player.fuel = base.fuel
    player.shootCount = base.ammunition
    player.availableRockets = base.availableRockets
    clearInterval(player.cooldownInterval)

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

    scene.add(player.model);
}

// Funkcja wyświetlająca ekran "Level Completed"
export function levelCompleted(scene, player, renderer, opponents, level) {
    level.started = true
    scene.remove(player.model);
    
    levelCompletedScreen.style.display = 'block';
    cancelAnimationFrame(renderer.domElement);

    // Obsługa przycisku "Next Level"
    nextLevelButton.addEventListener('click', () => {
        cleanLevel(player, opponents, scene);

        levelCompletedScreen.style.display = 'none';
        level.started = false
    });

    // Funkcja pokazująca sklep
    shopButton.addEventListener('click', () => {
        shopScreen.style.display = 'block';
        store(base, player);

        levelCompletedScreen.style.display = 'none';
    });
}

// Funkcja wyświetlająca ekran "Game Over"
export function gameOver(scene, player, opponents, level, renderer) {
    scene.remove(player.model);
    clearInterval(spawnInterval);

    opponents.forEach(opponent => {
        opponent.health = 0;
        scene.remove(opponent.model)
    })
    
    gameOverScreen.style.display = 'block';
    cancelAnimationFrame(renderer.domElement);

    restartButton.addEventListener('click', () => {
        cleanLevel(player, opponents, scene);

        opponents.forEach(opponent => {
            opponents.splice(opponent)
        })

        level.destroyedOpponents = 0;
        level.started = false

        gameOverScreen.style.display = 'none';
    });
}

// Funkcja wyświetlająca ekran ukończenia gry
export function gameCompleted(renderer) {
    gameCompletedScreen.style.display = 'block';
    cancelAnimationFrame(renderer.domElement);

    menuButton.addEventListener('click', () => {
        location.reload();
    });
}

export function basePlayer(){
    return base;
}

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
const bonusLevelButton = document.getElementById('bonusLevelButton');

const newElement = document.getElementById('new');
const bonusLevelInfo = document.getElementById("bonusLevelInfo")
const destroyedOpponentsInfo = document.getElementById("destroyedOpponents")

let spawnInterval;
let totalStars = 0;
let record = 0;
const tower = addTower();
tower.loadModel()
export const base = addPlayer()
export let currentLevelIndex;

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
        {   // 6
            numberOfOpponents: Infinity,
            destroyedOpponents: 0,
            spawnTime: 4500,
            damage: 2,
            started: false
        },
    ];

    return levels;
}

export function handleLevels(level, currentLevel, player, opponents, controls, scene){
    currentLevelIndex = level;
    // Rozpoczęcie poziomu
    if(level.started == false){
        level.started = true
        createOpponents(1, opponents, player, controls, scene, 0, level.damage)
        spawnInterval = createOpponents(level.numberOfOpponents, opponents, player, controls, scene, level.spawnTime, level.damage, currentLevel)

        // Wyświetlenie informacji o zmianach w poziomie
        if (controls.isLocked){
            const cooldownStartTime = Date.now();
            const infoInterval = setInterval(() => {
                const elapsedCooldown = Date.now() - cooldownStartTime;
                
                if (currentLevel == 2)
                    newElement.textContent = `Zwiększono obrażenia zadawane przez przeciwników.`;
                if (currentLevel == 3)
                    newElement.textContent = `Nowe zagrożenie: wieża. Niemożliwa do zniszczenia.`;
                if (currentLevel == 4)
                    newElement.textContent = `Nowy typ przeciwnika: kamikaze`;
                if (currentLevel == 5)
                    newElement.textContent = `Zniszcz jak najwięcej przeciwników!`;

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
    if (currentLevel >= 3 && currentLevel < 5){
        scene.add(tower.model)

        tower.fireProjectile(scene, player)
        tower.updateCollision(player, scene)
    }

    // Dodanie mgły w 5 poziomie
    if (currentLevel == 4){
        // scene.fog = new THREE.Fog( 0xcccccc, 10, 150 );
    }
    // Usunięcie wieży na dodatkowy poziom
    if (currentLevel == 5){
        scene.remove(tower.model)
        tower.projectiles.forEach(projectile => {
            scene.remove(projectile)
        });
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

function calculateStars(player, starsContainer){
    // Oblicz liczbę gwiazdek na podstawie zdrowia gracza
    let stars = 0;
    const healthPercentage = (player.health / base.health) * 100;

    if (healthPercentage > 66) {
        stars = 3;
    } else if (healthPercentage > 33) {
        stars = 2;
    } else {
        stars = 1;
    }

    totalStars += stars;

    // Wyświetl gwiazdki na ekranie poziomu ukończonego=
    starsContainer.innerHTML = '';

    for (let i = 0; i < stars; i++) {
        const starImage = document.createElement('img');
        starImage.src = '/star.png';
        starImage.alt = 'Star';
        starImage.style.width = '50px';
        starImage.style.margin = '5px';
        starsContainer.appendChild(starImage);
    }
}

// Funkcja wyświetlająca ekran "Level Completed"
export function levelCompleted(scene, player, renderer, opponents, level) {
    level.started = true;
    scene.remove(player.model);

    // Oblicz zarobione pieniądze
    const earnedMoney = player.health * 10;
    base.money += earnedMoney; // Aktualizacja pieniędzy gracza
    console.log(`Player earned ${earnedMoney} money. Total money: ${base.money}`);

    // Oblicz liczbę gwiazdek na podstawie zdrowia gracza
    const starsContainer = document.getElementById('stars-container');
    calculateStars(player, starsContainer)

    levelCompletedScreen.style.display = 'block';
    cancelAnimationFrame(renderer.domElement);

    // Obsługa przycisku "Next Level"
    nextLevelButton.addEventListener('click', () => {
        cleanLevel(player, opponents, scene);

        levelCompletedScreen.style.display = 'none';
        level.started = false;
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
    level.started = true
    scene.remove(player.model);
    clearInterval(spawnInterval);

    opponents.forEach(opponent => {
        opponent.health = 0;
        scene.remove(opponent.model)
    })
    
    gameOverScreen.style.display = 'block';
    cancelAnimationFrame(renderer.domElement);

    menuButton.addEventListener('click', () => {
        location.reload();
    });

    restartButton.addEventListener('click', () => {
        cleanLevel(player, opponents, scene);

        opponents.forEach(opponent => {
            opponents.splice(opponent)
        })

        level.destroyedOpponents = 0;
        level.started = false

        gameOverScreen.style.display = 'none';
        
        if (newRecord > record)
            record = newRecord
    });
    
    let newRecord = 0;
    if(level.numberOfOpponents == Infinity){
        bonusLevelInfo.textContent = `Liczba zniszczonych przeciwników: ${level.destroyedOpponents}`;
        destroyedOpponentsInfo.textContent = `Dotychczasowy rekord: ${record}`

        if (level.destroyedOpponents > record){
            newRecord  = level.destroyedOpponents
        }
    }
}

// Funkcja wyświetlająca ekran ukończenia gry
export function gameCompleted(level, player, opponents, scene, renderer) {
    level.started = true
    gameCompletedScreen.style.display = 'block';
    cancelAnimationFrame(renderer.domElement);

    // Oblicz liczbę gwiazdek na podstawie zdrowia gracza
    const starsContainer = document.getElementById('stars-container2');
    calculateStars(player, starsContainer)

    const menuButton = document.getElementById('menu2');
    menuButton.addEventListener('click', () => {
        location.reload();
    });

    if (totalStars == 3)
        bonusLevelButton.style.display = "block"
    
    bonusLevelButton.addEventListener('click', () => {
        cleanLevel(player, opponents, scene);
        gameCompletedScreen.style.display = 'none';
        level.started = false
    });
}

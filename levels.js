import { addPlayer } from './player';

const gameOverScreen = document.getElementById('gameover');
const levelCompletedScreen = document.getElementById('level-completed');
const base = addPlayer()

// Lista poziomów gry
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

export function getLevels(){
    return levels;
}

// Funkcja czyszcząca mapę itd.
function cleanLevel(player, opponents, scene){
    player.model.position.set(0, 0, 0)
    player.model.rotation.set(0, 0, 0)

    player.health = base.health
    player.fuel = base.fuel
    player.shootCount = base.ammunition
    player.availableRockets = base.availableRockets

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
}

// Funkcja wyświetlająca ekran "Level Completed"
export function levelCompleted(scene, player, renderer, opponents) {
    scene.remove(player.model);
    
    levelCompletedScreen.style.display = 'block';
    cancelAnimationFrame(renderer.domElement);

    const shopButton = document.getElementById('shop');
    const shopScreen = document.getElementById('shop-screen');
    const exitShopButton = document.getElementById('exitShop');
    const nextLevelButton = document.getElementById('nextLevelButton');
    const buyHealthButton = document.getElementById('buyHealth');
    const buySpeedButton = document.getElementById('buySpeed');
    const buyAmmoButton = document.getElementById('buyAmmo');

    // Obsługa przycisku "Next Level"
    nextLevelButton.addEventListener('click', () => {
        // Reset mapy i gracza
        cleanLevel(player, opponents, scene);

        levelCompletedScreen.style.display = 'none';
        scene.add(player.model);
    });

    // Funkcja pokazująca sklep
    shopButton.addEventListener('click', () => {
        shopScreen.style.display = 'block';
        levelCompletedScreen.style.display = 'none';
    });

    // Funkcja ukrywająca sklep
    exitShopButton.addEventListener('click', () => {
        shopScreen.style.display = 'none';
        levelCompletedScreen.style.display = 'block';
    });

    // Obsługa zakupu zdrowia
    buyHealthButton.addEventListener('click', () => {
        base.health += 5; // Dodaj 5 do zdrowia gracza
        console.log(`Player health increased to: ${player.health}`);
    });

    // Obsługa zakupu szybkości
    buySpeedButton.addEventListener('click', () => {
        player.speed += 0.05; // Dodaj 0.05 do szybkości gracza
        console.log(`Player speed increased to: ${player.speed}`);
    });

    // Obsługa zakupu amunicji
    buyAmmoButton.addEventListener('click', () => {
        base.ammunition += 10; // Dodaj 10 do amunicji gracza
        player.ammunition += 10; // Dodaj 10 do amunicji gracza
        console.log(`Player ammunition increased to: ${player.ammunition}`);
    });
}


// Funkcja restartująca grę
const restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', () => {
    location.reload();
});

// Funkcja wyświetlająca ekran "Game Over"
export function gameOver(scene, modelContainer, renderer) {
    scene.remove(modelContainer);
    
    gameOverScreen.style.display = 'block';
    cancelAnimationFrame(renderer.domElement);
}

export function basePlayer(){
    return base;
}

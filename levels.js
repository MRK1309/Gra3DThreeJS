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
        numberOfOpponents: 6,
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
    player.shootCount = base.shootCount
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

    const nextLevelButton = document.getElementById('nextLevelButton');
    nextLevelButton.addEventListener('click', () => {
        // Reset mapy i gracza
        cleanLevel(player, opponents, scene)

        levelCompletedScreen.style.display = 'none';
        scene.add(player.model);
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

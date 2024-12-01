const gameOverScreen = document.getElementById('gameover');
const levelCompletedScreen = document.getElementById('level-completed');

// Funkcja restartująca grę


// Funkcja restartująca grę
const restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', () => {
    location.reload();
});

// Funkcja wyświetlająca ekran "Level Completed"
export function levelCompleted(scene, player, renderer) {
    scene.remove(player.model);
    
    levelCompletedScreen.style.display = 'block';
    cancelAnimationFrame(renderer.domElement);

    const nextLevelButton = document.getElementById('nextLevelButton');
    nextLevelButton.addEventListener('click', () => {
        player.health = 20
        player.fuel = 1000
        player.shootCount = 40
        player.availableRockets = 2

        levelCompletedScreen.style.display = 'none';
        scene.add(player.model);
    });
}

// Funkcja wyświetlająca ekran "Game Over"
export function gameOver(scene, modelContainer, renderer) {
    scene.remove(modelContainer);
    
    gameOverScreen.style.display = 'block';
    cancelAnimationFrame(renderer.domElement);
}

const levels = [
    {   // 1
        numberOfOpponents: 5,
        destroyedOpponents: 0,
        damage: 1
    },
    {   // 2
        numberOfOpponents: 7,
        destroyedOpponents: 0,
        damage: 1
    },
    {   // 3
        numberOfOpponents: 7,
        destroyedOpponents: 0,
        damage: 2
    },
    {   // 4
        numberOfOpponents: 7,
        destroyedOpponents: 0,
        damage: 2
    },
    {   // 5
        numberOfOpponents: 7,
        destroyedOpponents: 0,
        damage: 2
    },
];

export function currentLevel(){
    return levels;
}

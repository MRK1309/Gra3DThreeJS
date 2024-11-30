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
    {
        numberOfOpponents: 4,
        destroyedOpponents: 0
    },
    {
        numberOfOpponents: 6,
        destroyedOpponents: 0
    },
    // {
    //     numberOfOpponents: 8,
    //     destroyedOpponents: 0
    // },
    // {
    //     numberOfOpponents: 10,
    //     destroyedOpponents: 0
    // },
    // Dodaj kolejne poziomy
];

export function currentLevel(){
    return levels;
}

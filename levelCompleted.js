const gameOverScreen = document.getElementById('gameover');
const levelCompletedScreen = document.getElementById('level-completed');

// Funkcja restartująca grę
const nextLevelButton = document.getElementById('nextLevelButton');
nextLevelButton.addEventListener('click', () => {
    location.reload();
});

// Funkcja restartująca grę
const restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', () => {
    location.reload();
});

// Funkcja wyświetlająca ekran "Level Completed"
export function levelCompleted(scene, modelContainer, renderer) {
    scene.remove(modelContainer);
    
    levelCompletedScreen.style.display = 'block';
    cancelAnimationFrame(renderer.domElement);
}

// Funkcja wyświetlająca ekran "Game Over"
export function gameOver(scene, modelContainer, renderer) {
    scene.remove(modelContainer);
    
    gameOverScreen.style.display = 'block';
    cancelAnimationFrame(renderer.domElement);
}

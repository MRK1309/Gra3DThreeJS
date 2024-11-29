const gameOverScreen = document.getElementById('gameover');

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

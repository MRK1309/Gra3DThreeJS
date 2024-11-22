const gameOverScreen = document.createElement('div');
gameOverScreen.style.position = 'absolute';
gameOverScreen.style.width = '100%';
gameOverScreen.style.top = '50%';
gameOverScreen.style.left = '50%';
gameOverScreen.style.transform = 'translate(-50%, -50%)';
gameOverScreen.style.fontSize = '3em';
gameOverScreen.style.color = 'white';
gameOverScreen.style.background = 'black';
gameOverScreen.style.textAlign = 'center';
gameOverScreen.style.display = 'none';
gameOverScreen.innerHTML = `
    <h1>Game Over</h1>
    <button id="restartButton">Restart</button>
`;
document.body.appendChild(gameOverScreen);

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

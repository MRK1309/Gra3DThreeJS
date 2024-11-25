const levelCompletedScreen = document.createElement('div');
levelCompletedScreen.style.position = 'absolute';
levelCompletedScreen.style.width = '100%';
levelCompletedScreen.style.top = '50%';
levelCompletedScreen.style.left = '50%';
levelCompletedScreen.style.transform = 'translate(-50%, -50%)';
levelCompletedScreen.style.fontSize = '3em';
levelCompletedScreen.style.color = 'white';
levelCompletedScreen.style.background = 'green';
levelCompletedScreen.style.textAlign = 'center';
levelCompletedScreen.style.display = 'none';
levelCompletedScreen.innerHTML = `
    <h1>Level 1 Completed</h1>
    <button id="nextLevelButton">Next Level</button>
`;
document.body.appendChild(levelCompletedScreen);

// Funkcja restartująca grę
const nextLevelButton = document.getElementById('nextLevelButton');
nextLevelButton.addEventListener('click', () => {
    location.reload();
});

// Funkcja wyświetlająca ekran "Level Completed"
export function levelCompleted(scene, modelContainer, renderer) {
    scene.remove(modelContainer);
    
    levelCompletedScreen.style.display = 'block';
    cancelAnimationFrame(renderer.domElement);
}
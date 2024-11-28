// radar.js

export function setupRadar(radarSize = 100) {
    const radarCanvas = document.createElement('canvas');
    radarCanvas.width = radarSize;
    radarCanvas.height = radarSize;
    radarCanvas.style.position = 'absolute';
    radarCanvas.style.top = '10px';
    radarCanvas.style.right = '10px';
    radarCanvas.style.border = '2px solid white';
    radarCanvas.style.borderRadius = '50%';
    radarCanvas.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    document.body.appendChild(radarCanvas);

    const radarContext = radarCanvas.getContext('2d');
    return { radarCanvas, radarContext, radarSize };
}

export function updateRadar(player, opponents, radarContext, radarSize) {
    const radarRange = 200;
    const radarCenter = radarSize / 2;

    // Wyczyść poprzednią ramkę radaru
    radarContext.clearRect(0, 0, radarSize, radarSize);

    // Narysuj obramowanie radaru
    radarContext.beginPath();
    radarContext.arc(radarCenter, radarCenter, radarCenter - 2, 0, 2 * Math.PI);
    radarContext.strokeStyle = 'white';
    radarContext.stroke();

    // Pozycja gracza (środek radaru)
    radarContext.fillStyle = 'blue';
    radarContext.beginPath();
    radarContext.arc(radarCenter, radarCenter, 4, 0, 2 * Math.PI);
    radarContext.fill();

    // Rysowanie przeciwników na radarze
    opponents.forEach(opponent => {
        if (!opponent.model || !opponent.model.position || opponent.health <= 0) return; // Pomijanie zniszczonych przeciwników

        const dx = opponent.model.position.x - player.model.position.x;
        const dz = opponent.model.position.z - player.model.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Pomijanie przeciwników poza zasięgiem
        if (distance > radarRange) return;

        // Skalowanie pozycji do radaru
        const radarX = radarCenter + (dx / radarRange) * radarCenter;
        const radarY = radarCenter + (dz / radarRange) * radarCenter;

        radarContext.fillStyle = 'red'; // Kolor przeciwnika
        radarContext.beginPath();
        radarContext.arc(radarX, radarY, 3, 0, 2 * Math.PI);
        radarContext.fill();
    });
}

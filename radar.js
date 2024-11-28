export function setupRadar(radarSize = 100) {
    const radarCanvas = document.getElementById('radar');
    radarCanvas.width = radarSize;
    radarCanvas.height = radarSize;

    const radarContext = radarCanvas.getContext('2d');
    return { radarCanvas, radarContext, radarSize };
}

export function updateRadar(player, opponents, radarContext, radarSize) {
    const radarRange = 200; // Zasięg radaru
    const radarCenter = radarSize / 2; // Środek radaru
    const playerRotation = player.model.rotation.y; // Orientacja gracza

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

        // Przeliczenie pozycji przeciwników względem orientacji gracza
        const angle = Math.atan2(dz, dx) - playerRotation;
        const radarX = radarCenter + Math.cos(angle) * (distance / radarRange) * radarCenter;
        const radarY = radarCenter + Math.sin(angle) * (distance / radarRange) * radarCenter;

        radarContext.fillStyle = 'red'; // Kolor przeciwnika
        radarContext.beginPath();
        radarContext.arc(radarX, radarY, 3, 0, 2 * Math.PI);
        radarContext.fill();
    });
}

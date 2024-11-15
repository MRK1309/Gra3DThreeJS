// Plansza początkowa
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
//Pasek życia
const healthBar = document.getElementById('health-bar');
const healthBarContainer = document.getElementById('health-bar-container');
//Paliwo
const fuelBar = document.getElementById('fuel-bar');
const fuelBarContainer = document.getElementById('fuel-bar-container');
//Pociski
const shootBar = document.getElementById('shoot-bar');
const shootBarContainer = document.getElementById('shoot-bar-container');
//Rakiety
const rocketIcons = document.getElementById('rocket-icons');
const rocket1 = document.getElementById('rocket1');
const rocket2 = document.getElementById('rocket2');

export function setupInterface(controls) {
    document.body.addEventListener('click', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
        healthBar.style.display = 'block'
        healthBarContainer.style.display = 'block'
        fuelBar.style.display = 'block'
        fuelBarContainer.style.display = 'block'
        shootBar.style.display = 'block'
        shootBarContainer.style.display = 'block'
        rocketIcons.style.display = 'block'
        rocket1.style.display = 'block'
        rocket2.style.display = 'block'
        controls.lock();
    }, false);
    
    controls.addEventListener('unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';
        healthBar.style.display = 'none'
        healthBarContainer.style.display = 'none'
        fuelBar.style.display = 'none'
        fuelBarContainer.style.display = 'none'
        shootBar.style.display = 'none'
        shootBarContainer.style.display = 'none'
        rocketIcons.style.display = 'none'
        rocket1.style.display = 'none'
        rocket2.style.display = 'none'
    });
}

export function updateBars(shootCount, fuel, health) {
    // Aktualizacja strzelania
    const shootPercentage = Math.max((shootCount / 40) * 100, 0);
    shootBar.style.width = `${shootPercentage}%`;

    // Aktualizacja paska paliwa
    const fuelPercentage = Math.max((fuel / 100) * 100, 0);
    fuelBar.style.width = `${fuelPercentage}%`;

    // Aktualizacja paska życia
    const healthPercentage = Math.max((health / 20) * 100, 0);
    healthBar.style.width = `${healthPercentage}%`;
}

import { base } from './levels';

// Plansza początkowa
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
//Plansze przejściowe
const levelCompletedScreen = document.getElementById('level-completed');
const shopScreen = document.getElementById('shop-screen');
const gameOverScreen = document.getElementById('gameover');
const gameCompletedScreen = document.getElementById('game-completed');
const screens = [levelCompletedScreen, shopScreen, gameOverScreen, gameCompletedScreen]
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
//Radar
const radar = document.getElementById('radar');
//Licznik przeciwników
const opponentsCounter = document.getElementById('opponents');

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
        radar.style.display = 'block'
        opponentsCounter.style.display = 'block'
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
        radar.style.display = 'none'
        opponentsCounter.style.display = 'none'
    });
}

function updateBars(shootCount, fuel, health, base) {
    // Aktualizacja strzelania
    const shootPercentage = Math.max((shootCount / base.ammunition) * 100, 0);
    shootBar.style.width = `${shootPercentage}%`;

    // Aktualizacja paska paliwa
    const fuelPercentage = Math.max((fuel / base.fuel) * 100, 0);
    fuelBar.style.width = `${fuelPercentage}%`;

    // Aktualizacja paska życia
    const healthPercentage = Math.max((health / base.health) * 100, 0);
    healthBar.style.width = `${healthPercentage}%`;
}

function updateRocketIcons(availableRockets) {
    const rocket2 = document.getElementById('rocket2');
    const rocket1 = document.getElementById('rocket1');

    if (availableRockets === 1) {
        rocket1.src = "rocket_locked.png";
    } else if (availableRockets === 0) {
        rocket2.src = "rocket_locked.png";
    } else if (availableRockets === 2) {
        rocket2.src = "rocket.png";
        rocket1.src = "rocket.png";
    }
}

function updateOponnentsCounter(level){
    if (level.numberOfOpponents == Infinity)
        opponentsCounter.textContent = `Liczba zniszczonych przeciwników: ${level.destroyedOpponents}`;
    else
        opponentsCounter.textContent = `Liczba przeciwników: ${level.numberOfOpponents+1 - level.destroyedOpponents}`;
}

export function updateInterface(player, level, controls){
    // Aktualizacja wszelkich pasków
    updateBars(player.shootCount, player.fuel, player.health, base);

    // Aktualizacja ikonek rakiet
    updateRocketIcons(player.availableRockets)

    // Aktualizacja licznika przeciwników
    updateOponnentsCounter(level);

    // Pauza gry, gdy jakaś plansza wyświetlona
    screens.forEach(i => {
        if(i.style.display == 'block')
            controls.unlock();
    });
}

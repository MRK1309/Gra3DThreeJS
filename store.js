import { currentLevelIndex } from './levels';

const levelCompletedScreen = document.getElementById('level-completed');
const shopScreen = document.getElementById('shop-screen');

const exitShopButton = document.getElementById('exitShop');
const buyHealthButton = document.getElementById('buyHealth');
const buySpeedButton = document.getElementById('buySpeed');
const buyAmmoButton = document.getElementById('buyAmmo');
const buyFasterReloadButton = document.getElementById('buyFasterReload');
const buyLessOpponentsButton = document.getElementById('buyLessOpponents');
const buyFuelButton = document.getElementById('buyFuel');

const playerMoneyDisplay = document.getElementById('playerMoney');
const notEnoughMoney = document.getElementById('notEnoughMoney');

let isShopInitialized = false;

export function store(base, player) {
    if (!isShopInitialized) {
        // Dodajemy listenery tylko raz
        exitShopButton.addEventListener('click', () => {
            shopScreen.style.display = 'none';
            levelCompletedScreen.style.display = 'block';
            notEnoughMoney.style.display = 'none';
        });

        buyHealthButton.addEventListener('click', () => {
            const price = 150;
            if (base.money >= price) {
                base.health += 5; // Dodaj 5 do zdrowia gracza
                base.money -= price;
                console.log(`Player health increased to: ${base.health}`);
                updateMoneyDisplay(base.money);
                notEnoughMoney.style.display = 'none';
            } else {
                console.log('Not enough money to buy health.');
                notEnoughMoney.style.display = 'block';
            }
        });

        buySpeedButton.addEventListener('click', () => {
            const price = 100;
            if (base.money >= price) {
                player.speed += 0.05; // Dodaj 0.05 do szybkości gracza
                base.money -= price;
                console.log(`Player speed increased to: ${player.speed}`);
                updateMoneyDisplay(base.money);
                notEnoughMoney.style.display = 'none';
            } else {
                console.log('Not enough money to buy speed.');
                notEnoughMoney.style.display = 'block';
            }
        });

        buyAmmoButton.addEventListener('click', () => {
            const price = 50;
            if (base.money >= price) {
                base.ammunition += 10;
                player.ammunition += 10;
                base.money -= price;
                console.log(`Player ammunition increased to: ${player.ammunition}`);
                updateMoneyDisplay(base.money);
                notEnoughMoney.style.display = 'none';
            } else {
                console.log('Not enough money to buy ammunition.');
                notEnoughMoney.style.display = 'block';
            }
        });

        buyFasterReloadButton.addEventListener('click', () => {
            const price = 75;
            if (base.money >= price) {
                if (player.reloadSpeed > 50) { // Minimalny czas odnowienia to 50ms
                    player.reloadSpeed -= 10;
                }
                base.money -= price;
                console.log(`Player reload speed increased to: ${player.reloadSpeed}ms`);
                updateMoneyDisplay(base.money);
                notEnoughMoney.style.display = 'none';
            } else {
                console.log('Not enough money to buy faster reload.');
                notEnoughMoney.style.display = 'block';
            }
        });
        
        buyLessOpponentsButton.addEventListener('click', () => {
            const price = 200;
            if (base.money >= price) {
                // Zmniejszenie liczby przeciwników w bieżącym poziomie
                if (currentLevelIndex.numberOfOpponents > 1) {
                    currentLevelIndex.numberOfOpponents -= 1;
                    base.money -= price;
                    console.log(`Number of opponents reduced to: ${currentLevelIndex.numberOfOpponents}`);
                    updateMoneyDisplay(base.money);
                    notEnoughMoney.style.display = 'none';
                } else {
                    console.log('Cannot reduce opponents below 1.');
                    notEnoughMoney.style.display = 'block';
                }
            } else {
                console.log('Not enough money to reduce opponents.');
                notEnoughMoney.style.display = 'block';
            }
        });
        buyFuelButton.addEventListener('click', () => {
            const price = 100;
            const fuelAmount = 20;
        
            if (base.money >= price) {
                base.fuel += fuelAmount; // Dodaj 20 paliwa
                base.money -= price;
                console.log(`Player fuel increased to: ${base.fuel}`);
                updateMoneyDisplay(base.money);
                notEnoughMoney.style.display = 'none';
            } else {
                console.log('Not enough money to buy fuel.');
                notEnoughMoney.style.display = 'block';
            }
        });


        isShopInitialized = true;
    }

    // Aktualizuj wyświetlanie pieniędzy
    updateMoneyDisplay(base.money);
}

function updateMoneyDisplay(money) {
    if (playerMoneyDisplay) {
        playerMoneyDisplay.textContent = `Money: ${money}`;
    }
}

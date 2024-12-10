const levelCompletedScreen = document.getElementById('level-completed');
const shopScreen = document.getElementById('shop-screen');

const exitShopButton = document.getElementById('exitShop');
const buyHealthButton = document.getElementById('buyHealth');
const buySpeedButton = document.getElementById('buySpeed');
const buyAmmoButton = document.getElementById('buyAmmo');

export function store(base, player){
    // Funkcja ukrywająca sklep
    exitShopButton.addEventListener('click', () => {
        shopScreen.style.display = 'none';
        levelCompletedScreen.style.display = 'block';
    });

    // Obsługa zakupu zdrowia
    buyHealthButton.addEventListener('click', () => {
        base.health += 5; // Dodaj 5 do zdrowia gracza
        console.log(`Player health increased to: ${base.health}`);
    });

    // Obsługa zakupu szybkości
    buySpeedButton.addEventListener('click', () => {
        player.speed += 0.05; // Dodaj 0.05 do szybkości gracza
        console.log(`Player speed increased to: ${player.speed}`);
    });

    // Obsługa zakupu amunicji
    buyAmmoButton.addEventListener('click', () => {
        base.ammunition += 10; // Dodaj 10 do amunicji gracza
        player.ammunition += 10; // Dodaj 10 do amunicji gracza
        console.log(`Player ammunition increased to: ${player.ammunition}`);
    });
}

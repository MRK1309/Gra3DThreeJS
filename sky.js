import { Sky } from 'three/examples/jsm/objects/Sky';
import { MathUtils, Vector3 } from 'three';

function createSky() {
    const sky = new Sky();
    sky.scale.setScalar(45000);

    // Konfiguracja materiału
    sky.material.uniforms['turbidity'].value = 0.9;
    sky.material.uniforms['rayleigh'].value = 2.5;
    sky.material.uniforms['mieCoefficient'].value = 0.08;
    sky.material.uniforms['mieDirectionalG'].value = 0.5;

    // Ustawienie pozycji słońca
    const phi = MathUtils.degToRad(90);
    const theta = MathUtils.degToRad(150);
    const sunPosition = new Vector3().setFromSphericalCoords(0.25, phi, theta);
    sky.material.uniforms.sunPosition.value = sunPosition;

    return sky;
}

export { createSky };
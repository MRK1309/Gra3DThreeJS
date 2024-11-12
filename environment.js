import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { Water } from 'three/examples/jsm/objects/Water.js';

export function createSky() {
    const sky = new Sky();
    sky.scale.setScalar(45000);

    // Konfiguracja materiału
    sky.material.uniforms['turbidity'].value = 0.9;
    sky.material.uniforms['rayleigh'].value = 2.5;
    sky.material.uniforms['mieCoefficient'].value = 0.08;
    sky.material.uniforms['mieDirectionalG'].value = 0.5;

    // Ustawienie pozycji słońca
    const phi = THREE.MathUtils.degToRad(90);
    const theta = THREE.MathUtils.degToRad(150);
    const sunPosition = new THREE.Vector3().setFromSphericalCoords(0.25, phi, theta);
    sky.material.uniforms.sunPosition.value = sunPosition;

    return sky;
}

export function createWater() {
    const geometry2 = new THREE.PlaneGeometry(10000, 10000);

    const waterNormals = new THREE.TextureLoader().load('/waternormals.jpg');
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

    const water = new Water(geometry2, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterNormals,
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
    });

    water.position.y = -10;
    water.rotation.x = Math.PI * - 0.5;

    return water;
}

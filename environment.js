import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function createSky() {
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

function createWater() {
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
        fog: true
    });

    water.rotation.x = Math.PI * - 0.5;

    return water;
}

function createGround(){
    const islands = new THREE.Object3D();

    const loader = new GLTFLoader();
    loader.load('/mapa2.glb', function (gltf) {
        islands.add(gltf.scene);
    });

    //oś x - prawo lewo
    //oś y - góra dół
    //oś z - przód tył

    return islands;
}

function createLight() {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;

    return directionalLight;
}

export function createEnvironment(scene){
    // Mapa
    const mapContainer = new THREE.Object3D();
    mapContainer.position.y = -55;
    scene.add(mapContainer);

    // Woda
    const water = createWater();
    mapContainer.add(water);

    // Ziemia
    const ground = createGround()
    mapContainer.add(ground);
    ground.position.y += 0.185;

    // Niebo
    const sky = createSky();
    scene.add(sky);

    // Światło
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const directionalLight = createLight();
    scene.add(directionalLight);

    return water;
}

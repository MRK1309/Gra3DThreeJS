import * as THREE from 'three'; 
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
const renderer = new THREE.WebGLRenderer(); 
renderer.setSize( window.innerWidth, window.innerHeight ); 
renderer.setAnimationLoop( animate ); 
document.body.appendChild( renderer.domElement ); 

const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material ); scene.add( cube ); 

camera.position.z = 5; camera.position.y = 1; 

function animate() { 
    const oldObjectPosition = new THREE.Vector3();
    cube.getWorldPosition(oldObjectPosition);

    // cube.position.z -= 0.01; 
  
    let d = 0.001; targetX = mouseX * d; targetY = mouseY * d;
    currentRotation.x += (targetRotation.x - currentRotation.x) * rotationSpeed;
    currentRotation.y += (targetRotation.y - currentRotation.y) * rotationSpeed;

    cube.position.x =+ currentRotation.x/100
    camera.rotation.y = -currentRotation.x/1000

    cube.position.y =- currentRotation.y/100
    camera.rotation.x = currentRotation.y/1000

    const newObjectPosition = new THREE.Vector3();
    cube.getWorldPosition(newObjectPosition);

    const delta = newObjectPosition.clone().sub(oldObjectPosition);
    camera.position.add(delta);

    renderer.render( scene, camera ); 
}

document.addEventListener("keydown", onDocumentKeyDown, false);
document.addEventListener("mousemove", onDocumentMouseMove, false);

function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 87) {
        const oldObjectPosition = new THREE.Vector3();
        cube.getWorldPosition(oldObjectPosition);

        cube.position.z -= 0.3;

        const newObjectPosition = new THREE.Vector3();
        cube.getWorldPosition(newObjectPosition);
    
        const delta = newObjectPosition.clone().sub(oldObjectPosition);
        camera.position.add(delta);
     } //else if (keyCode == 83) {
        const oldObjectPosition = new THREE.Vector3();
        cube.getWorldPosition(oldObjectPosition);

        cube.position.z += 0.03;

        const newObjectPosition = new THREE.Vector3();
        cube.getWorldPosition(newObjectPosition);
    
        const delta = newObjectPosition.clone().sub(oldObjectPosition);
        camera.position.add(delta);
    // } 
}

const geometry2 = new THREE.BoxGeometry( 3, 1, 1 ); 
const material2 = new THREE.MeshBasicMaterial( { color: 0x57ff33 } );
const cube2 = new THREE.Mesh( geometry2, material2 ); scene.add( cube2 ); 
cube2.position.y -= 1

let mouseX; let mouseY; let targetX; let targetY

const windowHalfX = window.innerWidth / 2
const windowHalfY = window.innerHeight / 2
let targetRotation = new THREE.Vector2();
let currentRotation = new THREE.Vector2();
let rotationSpeed = 0.01;

function onDocumentMouseMove (event) {
    mouseX = (event.clientX - windowHalfX)
    mouseY = (event.clientY - windowHalfY)
  targetRotation.x = mouseX;
  targetRotation.y = mouseY;
}

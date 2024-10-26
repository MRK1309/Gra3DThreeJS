import * as THREE from 'three'; 
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'

const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
const renderer = new THREE.WebGLRenderer(); 
renderer.setSize( window.innerWidth, window.innerHeight ); 
renderer.setAnimationLoop( animate ); 
document.body.appendChild( renderer.domElement ); 

const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material ); scene.add( cube ); 

camera.position.z = cube.position.z+3; camera.position.y = 1; 
const controls = new PointerLockControls((camera, cube), renderer.domElement)
document.body.addEventListener( 'click', function () {controls.lock();}, false );
cube.attach(camera)

function animate() { 
    controls.moveForward(0.01)
    renderer.render( scene, camera ); 
}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 87) {
        controls.moveForward(0.25)
     } 
}

const geometry2 = new THREE.BoxGeometry( 3, 1, 1 ); 
const material2 = new THREE.MeshBasicMaterial( { color: 0x57ff33 } );
const cube2 = new THREE.Mesh( geometry2, material2 ); scene.add( cube2 ); 
cube2.position.y -= 1

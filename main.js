import * as THREE from 'three'; 
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { createSky } from './sky';

//Przygotowanie sceny
const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
const renderer = new THREE.WebGLRenderer(); 
renderer.setSize( window.innerWidth, window.innerHeight ); 
renderer.setAnimationLoop( animate ); 
document.body.appendChild( renderer.domElement ); 

//GLTFLoader - załadowanie modelu samolotu
const modelContainer = new THREE.Object3D();
let myModel = new THREE.Object3D()
const loader = new GLTFLoader();
loader.load('/samolot.glb',function(gltf){
    myModel = gltf.scene
    modelContainer.add(myModel)
});
scene.add(modelContainer);

//Sterowanie i renderowanie
camera.position.z = modelContainer.position.z+13; camera.position.y = 5; 
const controls = new PointerLockControls(modelContainer, renderer.domElement)
document.body.addEventListener( 'click', function () {controls.lock();}, false );
modelContainer.attach(camera)

function animate() { 
    controls.moveForward(0.03)
    renderer.render( scene, camera ); 
}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 87) {
        controls.moveForward(0.25)
     } 
}

//Niebo i światło
const sky = createSky();
scene.add(sky);

const ambientLight = new THREE.AmbientLight(0xffffff, 100);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff,30);
spotLight.position.set(0, 15, 5);
spotLight.target.position.set(0,0,0);
scene.add(spotLight);
scene.add(spotLight.target);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

//Testowe obiekty
const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material ); scene.add( cube ); 

const geometry2 = new THREE.BoxGeometry( 3, 1, 1 ); 
const material2 = new THREE.MeshBasicMaterial( { color: 0x57ff33 } );
const cube2 = new THREE.Mesh( geometry2, material2 ); scene.add( cube2 ); 
cube2.position.y -= 1

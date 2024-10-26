import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { createSky } from './sky';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//Sky
const sky = createSky();
scene.add(sky);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const gridHelper = new THREE.GridHelper(100,100);
scene.add(gridHelper);

//GLTFLoader
const loader = new GLTFLoader();
loader.load('/samolot.glb',function(gltf){
  scene.add(gltf.scene);
});

const ambientLight = new THREE.AmbientLight(0xffffff, 100);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff,30);
spotLight.position.set(0, 15, 5);
spotLight.target.position.set(0,0,0);
scene.add(spotLight);
scene.add(spotLight.target);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

camera.position.z = 20;
camera.position.y = 10;
camera.position.x = -10;

const controls = new  OrbitControls(camera, renderer.domElement);

function animate() {
  // requestAnimationFrame(animate);
  // controls.update();
	renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

//Obiekt uderzenia
const geometry = new THREE.CircleGeometry(1, 32);
const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00 });

export function addOpponent(){
    const opponent = {
        model: new THREE.Object3D(), 
        boundingBox: new THREE.Box3(), 
        health: 10,
        projectiles: [],
        healthBar: new THREE.Mesh(),
        healthBarContainer: new THREE.Mesh(),
        hit: new THREE.Mesh(geometry, material2),
    
        follow: function(modelContainer) {
            const modelPosition = new THREE.Vector3();
            modelContainer.getWorldPosition(modelPosition);
        
            const directionToModel = new THREE.Vector3().subVectors(modelPosition, this.model.position).normalize();
            const distanceToModel = modelPosition.distanceTo(this.model.position);
        
            let direction = new THREE.Vector3();
        
            const offset = 0.1;
            if (distanceToModel > 20) {
                direction = directionToModel;
                this.model.position.add(direction.multiplyScalar(offset));
            } else {
                direction = directionToModel.negate();
                this.model.position.add(direction.multiplyScalar(offset));
            }
        
            const turnSpeed = 0.1;
            const currentRotation = this.model.rotation.y;
            const targetRotation = Math.atan2(direction.x, direction.z);
        
            this.model.rotation.y = THREE.MathUtils.lerp(currentRotation, targetRotation, turnSpeed);
        },
    
        setupHealthBar:  function() {
            const barWidth = 2;
            const barHeight = 0.2;
        
            const barGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
            const barMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            this.healthBar = new THREE.Mesh(barGeometry, barMaterial);
        
            const containerGeometry = new THREE.PlaneGeometry(barWidth + 0.1, barHeight + 0.1);
            const containerMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
            this.healthBarContainer = new THREE.Mesh(containerGeometry, containerMaterial);
        
            this.healthBar.position.set(0, 3, 0); // Nad przeciwnikiem
            this.healthBarContainer.position.set(0, 3, 0);
        
            this.model.add(this.healthBarContainer);
            this.model.add(this.healthBar);
        },
    
        updateHealthBar: function(maxHealth = 10) {
            if (this.healthBar) {
                const healthRatio = Math.max(this.health / maxHealth, 0); // Zapewnia, że pasek nie ma ujemnej długości
                this.healthBar.scale.x = healthRatio;
                this.healthBar.position.x = (1 - healthRatio) * -0.5; // Dopasowanie pozycji paska życia
            }
        },
    
        updateHealthBarOrientation: function (camera) {
            const cameraPosition = new THREE.Vector3();
            camera.getWorldPosition(cameraPosition);
        
            if (this.healthBarContainer) {
                this.healthBarContainer.lookAt(cameraPosition); // Ustawienie orientacji przodem do kamery
            }
            if (this.healthBar) {
                this.healthBar.lookAt(cameraPosition); // Ustawienie orientacji przodem do kamery
            }
        },
    
        getHit: function (modelContainer, scene) {
            this.hit.position.copy(this.model.position);
            this.hit.rotation.copy(modelContainer.rotation);
            scene.add(this.hit);
        },
    
        checkHit: function (scene) {
            if (this.hit.position.distanceTo(this.model.position) > 1) {
                scene.remove(this.hit);
            }
        },
    
        loadModel: function(){
            const opponentModelcontainer = new THREE.Object3D();
            const opponentBoundingBox = new THREE.Box3();
            const loader = new GLTFLoader();
    
            loader.load('/samolot_przeciwnik.glb', (gltf) => {
                const opponentModel = gltf.scene;
                opponentModel.rotation.y = Math.PI;
                opponentModelcontainer.add(opponentModel);
        
                opponentModelcontainer.position.z = -50;
                opponentBoundingBox.setFromObject(opponentModelcontainer);
            });
    
            this.model = opponentModelcontainer;
            this.boundingBox = opponentBoundingBox;
            this.setupHealthBar();
        }
    };

    return opponent;
}

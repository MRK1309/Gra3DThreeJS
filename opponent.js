import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

//Obiekt uderzenia
const geometry = new THREE.CircleGeometry(1, 32);
const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00 });

export function addOpponent(){
    const opponent = {
        type: "standard",
        model: new THREE.Object3D(), 
        boundingBox: new THREE.Box3(), 
        health: 10,
        projectiles: [],
        damage: 1,
        speed: 0.1,
        healthBar: new THREE.Mesh(),
        healthBarContainer: new THREE.Mesh(),
        hit: new THREE.Mesh(geometry, material2),
        isTurningAround: false,
    
        // Podążanie za graczem
        follow: function(modelContainer) {
            const modelPosition = new THREE.Vector3();
            modelContainer.getWorldPosition(modelPosition);
        
            const directionToModel = new THREE.Vector3().subVectors(modelPosition, this.model.position).normalize();
            const distanceToModel = modelPosition.distanceTo(this.model.position);
        
            let direction = new THREE.Vector3();
        
            const turnAroundDistance = 25; 
            const chaseDistance = 35;      
        
            if (this.type == "standard"){
                if (this.isTurningAround) {
                    if (distanceToModel > chaseDistance) {
                        this.isTurningAround = false;
                    } else {
                        direction = directionToModel.negate();
                        this.model.position.add(direction.multiplyScalar(this.speed));
                    }
                } else {
                    if (distanceToModel < turnAroundDistance) {
                        this.isTurningAround = true;
                    } else {
                        direction = directionToModel;
                        this.model.position.add(direction.multiplyScalar(this.speed));
                    }
                }
            } 
            else{
                direction = directionToModel;
                this.model.position.add(direction.multiplyScalar(this.speed));
            }
        
            const turnSpeed = 0.1;
            const currentRotation = this.model.rotation.y;
            const targetRotation = Math.atan2(direction.x, direction.z);
        
            this.model.rotation.y = THREE.MathUtils.lerp(currentRotation, targetRotation, turnSpeed);
        },
        
        // Omijanie innych przeciwników (bardzo wstępne)
        avoidOtherOpponents: function(opponents) {
            let direction = new THREE.Vector3();
            const offset = 0.1;
        
            opponents.forEach(opponent => {
                if (opponent !== this) {
                    const distanceToOpponent = this.model.position.distanceTo(opponent.model.position);
        
                    if (distanceToOpponent < 25) { 
                        if (opponent.health > 0){
                            const directionToOpponent = new THREE.Vector3().subVectors(opponent.model.position, this.model.position).normalize();
                            direction = directionToOpponent.negate();
                            this.model.position.add(direction.multiplyScalar(offset));
                        }
                    }
                }
            });
        },

        // Ustawienie pasków życia
        setupHealthBar:  function() {
            const barWidth = 2;
            const barHeight = 0.3;
        
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
    
        // Aktualizacja pasków życia
        updateHealthBar: function(maxHealth = 10) {
            if (this.healthBar) {
                const healthRatio = Math.max(this.health / maxHealth, 0); // Zapewnia, że pasek nie ma ujemnej długości
                this.healthBar.scale.x = healthRatio;
                this.healthBar.position.x = (1 - healthRatio) * -0.5; // Dopasowanie pozycji paska życia
            }
        },
    
        // Aktualizacja orientacji pasków życia
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
    
        // Dodanie obiektu uderzenia
        getHit: function (modelContainer, scene) {
            this.hit.position.copy(this.model.position);
            this.hit.rotation.copy(modelContainer.rotation);
            scene.add(this.hit);
        },
    
        // Usunięcie obiektu uderzenia
        checkHit: function (scene) {
            if (this.hit.position.distanceTo(this.model.position) > 1) {
                scene.remove(this.hit);
            }
        },
    
        // Wczytanie modelu
        loadModel: function(){
            const opponentModelcontainer = new THREE.Object3D();
            const opponentBoundingBox = new THREE.Box3();
            const loader = new GLTFLoader();

            let url;
            if (this.type == "kamikaze") url = '/kamikaze.glb';
            else url = '/samolot_przeciwnik.glb';
    
            loader.load(url, (gltf) => {
                const opponentModel = gltf.scene;
                opponentModel.rotation.y = Math.PI;
                
                opponentModelcontainer.add(opponentModel);
                opponentBoundingBox.setFromObject(opponentModelcontainer);
            });
    
            this.model = opponentModelcontainer;
            this.boundingBox = opponentBoundingBox;
            this.setupHealthBar();
        },

        // Wystrzelenie pocisku
        fireProjectile: function (scene) {
            if (this.projectiles.length >= 1) return;

            const geometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
            const material = new THREE.MeshBasicMaterial({ color: 0xAE243B });
            const projectile = new THREE.Mesh(geometry, material);

            projectile.position.copy(this.model.position);
            projectile.rotation.copy(this.model.rotation);

            const velocity = new THREE.Vector3(0, 0, 1);
            velocity.applyQuaternion(this.model.quaternion);
            velocity.y = 0;
            velocity.normalize().multiplyScalar(1);

            projectile.userData.velocity = velocity;
            this.projectiles.push(projectile);
            scene.add(projectile);
        },

        // Aktualizacja pocisków i kolizji
        updateCollision: function (player, scene){
            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const oprojectile = this.projectiles[i];
                oprojectile.position.add(oprojectile.userData.velocity);
    
                if (player.boundingBox.containsPoint(oprojectile.position)) {
                    player.getHit(scene);
    
                    player.health -= this.damage;
    
                    scene.remove(oprojectile);
                    this.projectiles.splice(i, 1);
    
                    continue;
                }
    
                if (oprojectile.position.distanceTo(player.model.position) > 100) {
                    scene.remove(oprojectile);
                    this.projectiles.splice(i, 1);
                }
            }
        }
    };

    return opponent;
}

export function createOpponents(numberOfOpponents, opponents, player, controls, scene, time, damage){
    let createdOpponents = 0;

    const interval = setInterval(() => {
        if (createdOpponents >= numberOfOpponents) {
            clearInterval(interval);
            return;
        }

        if (controls.isLocked) {
            const opponent = addOpponent();

            // Jeśli to poziom 5, to stwórz kamikaze
            if (numberOfOpponents == 7){
                if ([1, 3, 5].includes(createdOpponents)){
                    opponent.type = "kamikaze"
                    opponent.speed = 0.4;
                }
            }
            opponent.loadModel();

            let position;
            do {
                position = {
                    x: (Math.random() - 0.5) * 200,
                    z: (Math.random() - 0.5) * 200
                };
            } while (Math.sqrt(
                Math.pow(position.x - player.model.position.x, 2) +
                Math.pow(position.z - player.model.position.z, 2)
            ) < 100);

            opponent.model.position.x = position.x;
            opponent.model.position.z = position.z;

            opponent.damage = damage

            scene.add(opponent.model);
            opponents.push(opponent);
            createdOpponents++;
        }
    }, time);
}

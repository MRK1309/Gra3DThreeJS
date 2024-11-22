import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { dodge, getControlStates } from './controls';
import { fireRocket} from './rocket';

//Obiekt uderzenia
const geometry = new THREE.CircleGeometry(1, 32);
const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00 });

export function addPlayer(){
    const player = {
        model: new THREE.Object3D(), 
        boundingBox: new THREE.Box3(), 
        speed: 0.125,
        health: 20,
        fuel: 1000,
        fuelUsage: 0.1,
        shootCount: 40,
        projectiles: [],
        reloaded: true,
        hit: new THREE.Mesh(geometry, material2),
        
        // Zmniejszanie paliwa
        fuelConsume: function (controls) {
            setInterval(() => {
                if (this.fuel > 0 && controls.isLocked) {
                    this.fuel--;
                }
            }, 1000)
        },

        // Dodanie obiektu uderzenia
        getHit: function (scene) {
            this.hit.position.copy(this.model.position);
            this.hit.rotation.copy(this.model.rotation);
            scene.add(this.hit);
        },
    
        // Usunięcie obiektu uderzenia
        checkHit: function (scene) {
            if (this.hit.position.distanceTo(this.model.position) > 1) {
                scene.remove(this.hit);
            }
        },
    
        // Wczytanie modelu
        loadModel: function (){
            const modelContainer = new THREE.Object3D();
            const playerBoundingBox = new THREE.Box3();
            const loader = new GLTFLoader();
    
            loader.load('/samolot.glb', (gltf) => {
                const model = gltf.scene;
                modelContainer.add(model);
        
                playerBoundingBox.setFromObject(modelContainer);
            });
    
            this.model = modelContainer;
            this.boundingBox = playerBoundingBox;
        },

        // Wystrzelenie pocisku
        fireProjectile: function (scene) {
            const geometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const projectile = new THREE.Mesh(geometry, material);
        
            projectile.position.copy(this.model.position);
            projectile.rotation.copy(this.model.rotation);
        
            const velocity = new THREE.Vector3(0, 0, -1);
            velocity.applyQuaternion(this.model.quaternion);
            velocity.y = 0;
            velocity.normalize().multiplyScalar(1);
        
            projectile.userData.velocity = velocity;
            this.projectiles.push(projectile);
            scene.add(projectile);
        },

        // Przeładowanie broni
        reload: function (controls) {
            const interval = setInterval(() => {
                if (this.shootCount != 40 && controls.isLocked)
                    this.shootCount++;
        
                if (this.shootCount == 40)
                    clearInterval(interval);
            }, 100);
        },

        // Znalezienie najbliższego przeciwnika (dla rakiety)
        findNearest: function (opponents){
            let minDistance = opponents[0].model.position.distanceTo(this.model.position)
            let nearest = opponents[0];
            opponents.forEach(opponent => {
                if(opponent.model.position.distanceTo(this.model.position) < minDistance){
                    minDistance = opponent.model.position.distanceTo(this.model.position)
                    nearest = opponent
                }
            });
        
            return nearest.model;
        },

        // Obsługa sterowania
        useControls: function (controls, scene, opponents){
            const { forward, right, left, fire, rocket } = getControlStates();

            controls.moveForward(this.speed);
            if (forward) {
                controls.moveForward(this.speed * 2);
                this.fuel -= this.fuelUsage; // Szybsze zużycie paliwa
            }
            if (right) {
                dodge(this.speed * 2, controls);
                this.fuel -= this.fuelUsage; // Szybsze zużycie paliwa
            }
            if (left) {
                dodge(-this.speed * 2, controls);
                this.fuel -= this.fuelUsage; // Szybsze zużycie paliwa
            }
            if (fire) {
                if (this.shootCount > 0 && this.reloaded == true) {
                    this.fireProjectile(scene);
                    this.shootCount--;
                } else if (this.shootCount == 0) {
                    this.reloaded = false;
                    this.reload(controls);
                } else if (this.shootCount == 40) this.reloaded = true;
            }
            if (rocket) fireRocket(scene, this.model, this.findNearest(opponents), this.projectiles);
        },

        // Aktualizacja pocisków i kolizji
        updateCollision: function (opponents, scene){
            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const projectile = this.projectiles[i];
                projectile.position.add(projectile.userData.velocity);
    
                for (let j = 0; j < opponents.length; j++) {
                    const opponent = opponents[j];
    
                    if (scene.children.includes(opponent.model)) {
                        if (opponent.boundingBox.containsPoint(projectile.position)) {
                            opponent.getHit(this.model, scene);
    
                            if (projectile.userData.type === 'rocket') {
                                opponent.health -= 5;
                            } else {
                                opponent.health--;
                            }
    
                            scene.remove(projectile);
                            this.projectiles.splice(i, 1);
    
                            if (opponent.health <= 0) {
                                scene.remove(opponent.model);
                            }
                            continue;
                        }
                    }
                }   
                
                if (projectile.position.distanceTo(this.model.position) > 100) {
                    scene.remove(projectile);
                    this.projectiles.splice(i, 1);
                }
            }
        }
    };

    return player;
}

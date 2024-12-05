import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


export function addTower(){
    const tower = {
        model: new THREE.Object3D(), 
        projectiles: [],
        damage: 1,

        // Wczytanie modelu
        loadModel: function(){
            const towerModelContainer = new THREE.Object3D();
            const loader = new GLTFLoader();

            loader.load('/wieza.glb', (gltf) => {
                const towerModel = gltf.scene;
                towerModelContainer.add(towerModel);
                
                towerModelContainer.position.y = -20
                towerModelContainer.position.z = -180
                towerModelContainer.position.x = -250

            });
            this.model = towerModelContainer;
        },

        // Wystrzelenie pocisku
        fireProjectile: function (scene, player) {
            if (this.projectiles.length >= 1) return;

            const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
            const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const projectile = new THREE.Mesh(geometry, material);

            projectile.position.copy(this.model.position);
            projectile.position.y += 10
            projectile.rotation.copy(this.model.rotation);
            
            const directionToPlayer = new THREE.Vector3().subVectors(player.model.position, projectile.position).normalize();
            projectile.lookAt(player.model.position);

            const velocity = directionToPlayer.multiplyScalar(5)
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
    
                if (oprojectile.position.distanceTo(player.model.position) > 500) {
                    scene.remove(oprojectile);
                    this.projectiles.splice(i, 1);
                }
            }
        }
    };

    return tower;
}

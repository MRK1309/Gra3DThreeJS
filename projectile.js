import * as THREE from 'three';

export function fireProjectile(scene, modelContainer, projectiles) {
    const geometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const projectile = new THREE.Mesh(geometry, material);

    projectile.position.copy(modelContainer.position);
    projectile.rotation.copy(modelContainer.rotation);

    const velocity = new THREE.Vector3(0, 0, -1);
    velocity.applyQuaternion(modelContainer.quaternion);
    velocity.y = 0;
    velocity.normalize().multiplyScalar(1);

    projectile.userData.velocity = velocity;
    projectiles.push(projectile);
    scene.add(projectile);
}

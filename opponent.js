import * as THREE from 'three';

const geometry = new THREE.CircleGeometry(1, 32);
const material2 = new THREE.MeshBasicMaterial({color: 0xed0909});
const opponentHit = new THREE.Mesh(geometry, material2);

export function opponentFollow(opponent, modelContainer){
    const modelPosition = new THREE.Vector3();
    modelContainer.getWorldPosition(modelPosition);  

    const directionToModel = new THREE.Vector3().subVectors(modelPosition, opponent.position).normalize();
    const distanceToModel = modelPosition.distanceTo(opponent.position);

    let direction = new THREE.Vector3()
    
    const offset = 0.1;
    if (distanceToModel > 20) {
        direction = directionToModel
        opponent.position.add(direction.multiplyScalar(offset));
    } 
    else {
        direction = directionToModel.negate(); 
        opponent.position.add(direction.multiplyScalar(offset));
    }

    const turnSpeed = 0.1;  
    const currentRotation = opponent.rotation.y; 
    const targetRotation = Math.atan2(direction.x, direction.z); 

    opponent.rotation.y = THREE.MathUtils.lerp(currentRotation, targetRotation, turnSpeed);

    // console.log(distanceToModel)
}

export function opponentGetHit(opponentModelContainer, modelContainer, scene){
    opponentHit.position.copy(opponentModelContainer.position);
    opponentHit.rotation.copy(modelContainer.rotation);
    scene.add(opponentHit);
}

export function checkHit(opponentModelContainer, scene){
    if (opponentHit.position.distanceTo(opponentModelContainer.position) > 1) {
        scene.remove(opponentHit);
    }
}

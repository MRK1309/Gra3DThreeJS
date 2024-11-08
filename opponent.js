import * as THREE from 'three';

export function opponentFollow(opponent, modelContainer){
    const modelPosition = new THREE.Vector3();
    modelContainer.getWorldPosition(modelPosition);  

    const directionToModel = new THREE.Vector3().subVectors(modelPosition, opponent.position).normalize();
    const distanceToModel = modelPosition.distanceTo(opponent.position);

    const offset = 0.1;
    if (distanceToModel > 20) {
        opponent.position.add(directionToModel.multiplyScalar(offset));
    } 
    else {
        const oppositeDirection = directionToModel.negate(); 
        opponent.position.add(oppositeDirection.multiplyScalar(offset));
    }

    const turnSpeed = 0.1;  
    const currentRotation = opponent.rotation.y; 
    const targetRotation = Math.atan2(directionToModel.x, directionToModel.z); 

    opponent.rotation.y = THREE.MathUtils.lerp(currentRotation, targetRotation, turnSpeed);
}
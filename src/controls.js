// The chase camera is behind a car whose nose points along local +Z.
// In Three.js, positive yaw moves that nose toward the viewer's LEFT.
// Therefore left input needs positive steering and right input negative steering.
export function steeringInput(keys, touch) {
  const left = keys.KeyA || keys.ArrowLeft || touch.left;
  const right = keys.KeyD || keys.ArrowRight || touch.right;
  return Number(Boolean(left)) - Number(Boolean(right));
}

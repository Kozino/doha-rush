import test from 'node:test';
import assert from 'node:assert/strict';
import { steeringInput } from '../src/controls.js';

const noTouch = { left: false, right: false };
const map = (yaw) => [Math.sin(yaw), Math.cos(yaw)];

function horizontalScreenMovement(yaw, steering) {
  const before = map(yaw);
  const after = map(yaw + steering * 0.1);
  // Chase camera faces the nose (+Z); its screen-right direction in world XZ.
  const screenRight = [-Math.cos(yaw), Math.sin(yaw)];
  return (after[0] - before[0]) * screenRight[0]
    + (after[1] - before[1]) * screenRight[1];
}

test('left arrow and A steer left; right arrow and D steer right', () => {
  for (const code of ['ArrowLeft', 'KeyA']) {
    assert.equal(steeringInput({ [code]: true }, noTouch), 1, code);
  }
  for (const code of ['ArrowRight', 'KeyD']) {
    assert.equal(steeringInput({ [code]: true }, noTouch), -1, code);
  }
  assert.equal(steeringInput({ ArrowLeft: true, ArrowRight: true }, noTouch), 0);
  assert.equal(steeringInput({}, noTouch), 0);
});

test('touch steering uses the same directions as the keyboard', () => {
  assert.equal(steeringInput({}, { left: true, right: false }), 1);
  assert.equal(steeringInput({}, { left: false, right: true }), -1);
});

test('turning left goes screen-left and turning right goes screen-right from any heading', () => {
  for (const yaw of [0, 0.65, -1.3, Math.PI / 2, Math.PI]) {
    assert.ok(horizontalScreenMovement(yaw, steeringInput({ ArrowLeft: true }, noTouch)) < 0, `left at ${yaw}`);
    assert.ok(horizontalScreenMovement(yaw, steeringInput({ ArrowRight: true }, noTouch)) > 0, `right at ${yaw}`);
    // Minimap triangle (0,-1) rotated by PI-yaw points toward world forward (+Z).
    const arrowAngle = Math.PI - yaw;
    assert.ok(Math.abs(Math.sin(arrowAngle) - Math.sin(yaw)) < 1e-9);
    assert.ok(Math.abs(-Math.cos(arrowAngle) - Math.cos(yaw)) < 1e-9);
  }
});

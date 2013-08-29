var THREE = require('three');

var turnSpeed = 0.07;
var moveSpeed = 0.08;
var accel = 0.03;
var g = 0.01;
var sensitivityX = 0.03;
var sensitivityY = 0.03;

function ShipController(keys, mouse, ship) {
	if (!(this instanceof ShipController)) {
		return new ShipController(keys, mouse, ship);
	}

	this.keys = keys;
	this.mouse = mouse;
	this.ship = ship;

	return this;
};

ShipController.prototype.update = function() {
	var keys = this.keys;
	var mouse = this.mouse;
	var ship = this.ship;

	function handleKeyboard() {
		if (keys.left) { ship.rotation.y += turnSpeed; }
		if (keys.right) { ship.rotation.y -= turnSpeed; }
		if (keys.up) { ship.rotation.x -= turnSpeed; }
		if (keys.down) { ship.rotation.x += turnSpeed; }
		if (keys.q) { ship.rotation.z += turnSpeed; }
		if (keys.e) { ship.rotation.z -= turnSpeed; }
		if (keys.a) { ship.position.x -= moveSpeed; }
		if (keys.d) { ship.position.x += moveSpeed; }
		if (keys.w) { ship.position.z -= moveSpeed; }
		if (keys.s) { ship.position.z += moveSpeed; }

		ship.rotation.y -= mouse.deltaX * sensitivityX;
		ship.rotation.x += mouse.deltaY * sensitivityY;
	}

	function updatePhysics() {
		// Calculate ship's x, y, z axes world coordinates and store
		// in shop.{right,up,back}.
		// TODO move to a better place.
		var rot = new THREE.Matrix4();
		var els = rot.elements;
		rot.makeRotationFromEuler(ship.rotation);
		ship.right = new THREE.Vector3(els[0], els[1], els[2]);
		ship.up = new THREE.Vector3(els[4], els[5], els[6]);
		ship.back = new THREE.Vector3(els[8], els[9], els[10]);

		if (keys.space) {
			// untested
			var thrust = ship.up.clone();
			thrust.multiplyScalar(accel);
			ship.velocity.add(thrust);
		}

		ship.velocity.y -= g;
		ship.position.add(ship.velocity);

	}

	handleKeyboard();
	updatePhysics();
};

exports.ShipController = ShipController;


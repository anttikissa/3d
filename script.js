//// Basic three.js init

var width = window.innerWidth - 10;
var height = window.innerHeight - 10;

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer(); 
renderer.shadowMapEnabled = true;
renderer.setSize(width, height);

var camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
scene.add(camera);
camera.position = { x: -5, y: 5, z: 5 };
camera.lookAt(scene.position);

document.body.appendChild(renderer.domElement);



//// Misc config

var wireframe = false;



//// Keyboard handling

var keyname = require('keyname');
var keynameOrLetter = function(keyCode) {
	// Map 65-90 to [a-z]
	if (65 <= keyCode && keyCode <= 90) {
		return String.fromCharCode(keyCode + 32);
	}
	return keyname(keyCode);
}

// Keys that are down.
var keys = {};

window.onkeyup = function(e) {
	var key = keynameOrLetter(e.keyCode);
	if (key) {
		keys[key] = false;
	}
}

window.onkeydown = function(e) {
	var key = keynameOrLetter(e.keyCode);
	if (key) {
		keys[key] = true;
	}
}



//// Objects

function Plane() {
	var n = 20;
	var geometry = new THREE.PlaneGeometry(n, n, n, n);
	var material = new THREE.MeshLambertMaterial(
		{ color: 0x00ff00, wireframe: wireframe });
	var plane = new THREE.Mesh(geometry, material);
	plane.rotation.x -= Math.PI / 2;
	plane.receiveShadow = true;

	scene.add(plane);

	return plane;
}

// The position where ship is on the ground
var shipGroundY = 0.3;

function Ship() {
	var geometry = new THREE.Geometry();

	var midpoint = [0, .2, -.6];

	function vec(x, y, z) {
		geometry.vertices.push(
				new THREE.Vector3(
					x - midpoint[0],
					y - midpoint[1],
					z - midpoint[2]));
	}

	vec(0, 0, -2);
	vec(-1, 0, 0);
	vec(0, .6, 0);
	vec(1, 0, 0);

	function face(a, b, c) {
		geometry.faces.push(new THREE.Face3(a, b, c));
	}

	face(0, 1, 2);
	face(0, 2, 3);
	face(0, 3, 1);
	face(3, 2, 1);

	geometry.computeFaceNormals();

	var material = new THREE.MeshPhongMaterial({
		color: 0x333333, wireframe: wireframe
		/* uncomment for transparency */
		/*
		opacity: 0.6, 
		transparent: true, 
		depthWrite: false  */
	});

	var ship = new THREE.Mesh(geometry, material);

	// Works but shadows don't work afterwards
//	var wireframeMaterial = new THREE.MeshBasicMaterial({
//		color: 0x888888, wireframe: true, wireframeLinewidth: 3
//	});
//	var ship = THREE.SceneUtils.createMultiMaterialObject(
//		geometry, [material, wireframeMaterial]);

	ship.position.y = shipGroundY + 0.01;
	console.log(ship.rotation.order);
	ship.rotation.order = 'YXZ';

	ship.velocity = new THREE.Vector3(0, 0, 0);

	ship.castShadow = true;
	scene.add(ship);

	return ship;
}

var plane = Plane();
var ship = Ship();



//// Light

function Light() {
	light = new THREE.DirectionalLight(0xFFFFFF);
	light.position.set(0, 100, 0);
	light.target.position.set(0, 0, 0);
	light.castShadow = true;

	light.shadowMapWidth = 1024;
	light.shadowMapHeight = 1024;
	light.shadowCameraNear = 0.1;
	light.shadowCameraFar = 110;
	light.shadowCameraFov = 50;

	light.shadowCameraLeft = -10;
	light.shadowCameraRight = 10;
	light.shadowCameraTop = 10;
	light.shadowCameraBottom = -10;

	// debug
//	light.shadowCameraVisible = true;
	scene.add(light);
	return light;
}

var light = Light();



//// Camera

var turnSpeed = 0.02;
var moveSpeed = 0.08;
var accel = 0.05;
var g = 0.02;

function frame() {
	requestAnimationFrame(frame);

	// FPS-style camera

	var fps = false;
	if (fps) {
		if (keys.left) {
			camera.rotation.y += turnSpeed;
		}

		if (keys.right) {
			camera.rotation.y -= turnSpeed;
		}

		if (keys.up) {
			camera.rotation.x += turnSpeed;
		}

		if (keys.down) {
			camera.rotation.x -= turnSpeed;
		}

		if (keys.a) {
			camera.position.x -= moveSpeed;
		}

		if (keys.d) {
			camera.position.x += moveSpeed;
		}

		if (keys.w) {
			camera.position.z -= moveSpeed;
		}

		if (keys.s) {
			camera.position.z += moveSpeed;
		}
	}

	if (keys.left) {
		ship.rotation.y += turnSpeed;
	}

	if (keys.right) {
		ship.rotation.y -= turnSpeed;
	}

	if (keys.up) {
		ship.rotation.x -= turnSpeed;
	}

	if (keys.down) {
		ship.rotation.x += turnSpeed;
	}

	if (keys.a) {
		ship.position.x -= moveSpeed;
	}

	if (keys.d) {
		ship.position.x += moveSpeed;
	}

	if (keys.w) {
		ship.position.z -= moveSpeed;
	}

	if (keys.s) {
		ship.position.z += moveSpeed;
	}

	if (keys.q) {
		ship.rotation.z += turnSpeed;
	}

	if (keys.e) {
		ship.rotation.z -= turnSpeed;
	}

	if (keys.space) {
		ship.velocity.y += accel;
	}

	ship.velocity.y -= g;
	ship.position.add(ship.velocity);

	if (ship.position.y < shipGroundY) {
		ship.position.y = shipGroundY;
		ship.velocity.set(0, 0, 0);
	}

	camera.lookAt(ship.position);

	// render
	renderer.render(scene, camera);
}

frame();


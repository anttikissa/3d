var THREE = require('three');



//// Basic three.js init

var width = window.innerWidth - 10;
var height = window.innerHeight - 10;

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer(); 

renderer.shadowMapEnabled = true;
renderer.setSize(width, height);
renderer.setClearColor(0x444444, 1);

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
	var n = 40;
	var geometry = new THREE.CubeGeometry(n, n, 2, n, n); // Three.js geometry
	var material = new THREE.MeshLambertMaterial(
		{ color: 0x00ff00, wireframe: wireframe });
	var plane = new THREE.Mesh(geometry, material);

	plane.position.y = -1;
	plane.rotation.x = Math.PI / 2;
	plane.receiveShadow = true;

	scene.add(plane);

	return plane;
}

// The position where ship is on the ground
var shipGroundY = 0.3;

function Ship() {
	var geometry = new THREE.Geometry();

	// Where center of gravity is supposed to be
	var midpoint = [0, .2, -.6];

	physicsPoints = [];

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

	ship.position.y = shipGroundY + 0.01;
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

var turnSpeed = 0.07;
var moveSpeed = 0.08;
var accel = 0.03;
var g = 0.01;

function frame() {
	requestAnimationFrame(frame);

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

	if (keys.q) {
		ship.rotation.z += turnSpeed;
	}

	if (keys.e) {
		ship.rotation.z -= turnSpeed;
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

	var rot = new THREE.Matrix4();
	rot.makeRotationFromEuler(ship.rotation);

	if (keys.space) {
		var els = rot.elements;
		var right = [els[0], els[1], els[2]];
		var up = new THREE.Vector3(els[4], els[5], els[6]);
		console.log("up", right);
		up.multiplyScalar(accel);
//		var z = [els[8], els[9], els[10]];

//		console.log("rotation", ship.rotation);
//		console.log(up);
		ship.velocity.add(up);
	}

	ship.velocity.y -= g;
	ship.position.add(ship.velocity);

	if (ship.position.y < shipGroundY) {
		ship.position.y = shipGroundY;
		ship.velocity.set(0, 0, 0);
	}


	camera.position = {
		x: ship.position.x,
		y: ship.position.y + 4,
		z: ship.position.z + 10
	}
	camera.lookAt(ship.position);

	// render
	renderer.render(scene, camera);
}

frame();


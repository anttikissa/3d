//// Basic three.js init

var width = window.innerWidth - 10;
var height = window.innerHeight - 10;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
var renderer = new THREE.WebGLRenderer(); 
renderer.setSize(width, height);

scene.add(camera);

camera.position.z = 15;
camera.position.y = 2;

document.body.appendChild(renderer.domElement);



//// Keyboard handling

var keyname = require('keyname');

// Keys that are down.
var keys = {};

window.onkeyup = function(e) {
	var key = keyname(e.keyCode);
	if (key) {
		keys[key] = false;
	}
}

window.onkeydown = function(e) {
	var key = keyname(e.keyCode);
	if (key) {
		keys[key] = true;
	}
}



//// Objects

function Plane() {
	var n = 20;
	var geometry = new THREE.PlaneGeometry(n, n, n, n);
	var material = new THREE.MeshBasicMaterial(
		{ color: 0x00ff00, wireframe: true });
	var plane = new THREE.Mesh(geometry, material);
	plane.rotation.x += Math.PI / 2;

	scene.add(plane);

	return plane;
}

function Ship() {
	var geometry = new THREE.CubeGeometry(1, 1, 1);
	var material = new THREE.MeshBasicMaterial(
		{ color: 0xff0000, wireframe: true });
	var ship = new THREE.Mesh(geometry, material);

	ship.position.y = 0.5;
	scene.add(ship);

	return ship;
}

var plane = Plane();
var ship = Ship();

//// Camera

var turnSpeed = 0.02;

function frame() {
	requestAnimationFrame(frame);

	// FPS-style camera
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

	// render
	renderer.render(scene, camera);
}

frame();


var THREE = require('three');



//// Basic three.js init

var width = window.innerWidth - 10;
var height = window.innerHeight - 10;

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer(); 

renderer.shadowMapEnabled = true;
renderer.setSize(width, height);
renderer.setClearColor(0x444444, 1);

var camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
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

var mouseDampingFactor = 0.4;

var mouse = {
	deltaX: 0,
	deltaY: 0,

	update: function() {
		this.deltaX = this.deltaX *= mouseDampingFactor;
		this.deltaY = this.deltaY *= mouseDampingFactor;
	}
};

window.onmousemove = function(e) {
	if (mouse.prevX) {
		mouse.deltaX = e.x - mouse.prevX;
	}
	if (mouse.prevY) {
		mouse.deltaY = e.y - mouse.prevY;
	}
	mouse.prevX = e.x;
	mouse.prevY = e.y;

//	console.log(e);
//	console.log("mouse delta", mouse.deltaX, mouse.deltaY);
};




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

function Ship() {
	var geometry = new THREE.Geometry();

	// The position where ship is on the ground
	var shipGroundY = 0.3;

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
		, opacity: 0.6, 
		transparent: true, 
		depthWrite: false
	});

	var ship = new THREE.Mesh(geometry, material);

	ship.groundY = shipGroundY;
	ship.position.y = shipGroundY + 0.02;
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
	light.shadowCameraNear = 1;
	light.shadowCameraFar = 200;
	light.shadowCameraFov = 50;

	light.shadowCameraLeft = -10;
	light.shadowCameraRight = 15;
	light.shadowCameraTop = 10;
	light.shadowCameraBottom = -15;

	// debug
//	light.shadowCameraVisible = true;
	scene.add(light);
	return light;
}

var light = Light();



//// Camera

var ShipController = require('./js/ShipController').ShipController;

var shipController = ShipController(keys, mouse, ship);

function update() {
	shipController.update();
	mouse.update();

	light.position.copy(ship.position);
	light.position.y += 15;
	light.target.position.copy(light.position);
	light.target.position.y -= 100;

	camera.position = {
		x: ship.position.x,
		y: ship.position.y + 4,
		z: ship.position.z + 10
	}
	camera.lookAt(ship.position);
}

function draw() {
	renderer.render(scene, camera);
}

function frame() {
	requestAnimationFrame(frame);
	update();
	draw();
}

frame();


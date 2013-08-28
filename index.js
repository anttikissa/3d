// heightmap to buffer
//https://github.com/mrdoob/three.js/issues/1003

function timer(what) {
	return {
		startTime: new Date(),
		stop: function() {
			var now = new Date();
			console.log(what + " took " + (now - this.startTime) + " ms");
		}
	};
}

function getHeightData(img) {
	var t = timer('getHeightData');
	var s = 256;
    var canvas = document.createElement( 'canvas' );
    canvas.width = s;
    canvas.height = s;
    var context = canvas.getContext( '2d' );

    var size = s * s, data = new Float32Array( size );

    context.drawImage(img,0,0);

    for ( var i = 0; i < size; i ++ ) {
        data[i] = 0
    }

    var imgd = context.getImageData(0, 0, s, s);
    var pix = imgd.data;

    var j=0;
    for (var i = 0, n = pix.length; i < n; i += (4)) {
        var all = pix[i]+pix[i+1]+pix[i+2];
        data[j++] = all/3;
    }

	t.stop();

    return data;
}

var heightmapImg = document.querySelector('img.heightmap');
var heightData = getHeightData(heightmapImg);
console.log(heightData.length);



//// Pointer lock - works in Chrome

function lockPointer() {
	var el = document.body;
	el.requestPointerLock = el.requestPointerLock || el.webkitRequestPointerLock;
	document.body.requestPointerLock();
}

var THREE = require('three');



//// Basic three.js init

var width = window.innerWidth - 20;
var height = window.innerHeight - 20;

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

var captureMouse = false;

document.body.onmousemove = function(e) {
	if (!captureMouse) {
		mouse.deltaX = 0;
		mouse.deltaY = 0;
		return;
	}

	// Try accessing pointer locked mouse
	var movementX = event.movementX || event.webkitMovementX;
	var movementY = event.movementY || event.webkitMovementY;

	if (typeof movementX !== 'undefined') {
		mouse.deltaX = movementX;
		mouse.deltaY = movementY;
		return;
	}

	// Old-fashioned mouse capture
	if (mouse.prevX) {
		mouse.deltaX = e.x - mouse.prevX;
	}
	if (mouse.prevY) {
		mouse.deltaY = e.y - mouse.prevY;
	}
	mouse.prevX = e.x;
	mouse.prevY = e.y;

//	console.log("mouse delta", mouse.deltaX, mouse.deltaY);
};

window.onmousedown = function(e) {
	if (!captureMouse) {
		var info = document.querySelector('.info');
		info.classList.add('hidden');
		console.log(info);

		captureMouse = true;
		lockPointer();
	}

	console.log(e);
}




//// Objects

// convert [0.255] to something suitable for playing
function convertHeight(orig) {
	return -20 + .08 * orig;
}

function Plane() {
	var pt = timer('plane');
	var n = 256;

	var tg = timer('create geometry');
	var geometry = new THREE.PlaneGeometry(n, n, n, n);
	tg.stop();

	var t = timer('adjust vertices');
	for (var i = 0; i < geometry.vertices.length; i++) {
		var y = Math.floor(i / 257);
		var x = i % 257;
		// TODO interpolate x and y properly
		var h = heightData[x + y * 256 ];
		/*
		if (x < 128)
			h = 0; */

		geometry.vertices[i].z += convertHeight(h);
	}
	t.stop();

	function getColor(i) {
		var y = Math.floor(i / 257);
		var x = i % 257;
		// TODO interpolate x and y properly
		var h = heightData[x + y * 256 ];
		h *= 0.85;
		return new THREE.Color((h << 16) + (h << 8) + h);
	}

	t = timer('figure out colors');
	for (var i = 0; i < geometry.faces.length; i++) {
		var face = geometry.faces[i];

		face.vertexColors = [
			getColor(face.a),
			getColor(face.b),
			getColor(face.c)
		]
	}
	t.stop();

	var material = new THREE.MeshBasicMaterial(
		{ wireframe: wireframe,
		  vertexColors: THREE.VertexColors });
	var plane = new THREE.Mesh(geometry, material);
	plane.rotation.x -= Math.PI / 2;
	plane.receiveShadow = true;

	scene.add(plane);

	pt.stop();
	return plane;
}

function Ship() {
	var t = timer('ship');

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
	ship.position.x = -4;
	ship.position.z = 4;
	ship.rotation.order = 'YXZ';

	ship.velocity = new THREE.Vector3(0, 0, 0);

	ship.castShadow = true;
	scene.add(ship);

	t.stop();
	return ship;
}

var plane = Plane();
var ship = Ship();

//// Light

function Light() {
	light = new THREE.SpotLight(0xFFFFFF);
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

function heightAt(x, y) {
//	console.log('height', x, y);
	x += 127.5;
	x = Math.floor(x);
	x = Math.min(Math.max(0, x), 255);
	y += 127.5;
	y = Math.floor(y);
	y = Math.min(Math.max(0, y), 255);

	var h = convertHeight(heightData[y * 256 + x]); 
//	console.log('height at', x, y, h);
	return h;
}

function update() {
	shipController.update();

	// Handle ship-ground collision
	var groundHeight = heightAt(ship.position.x, ship.position.z);
	if (ship.position.y < ship.groundY + groundHeight) {
		ship.position.y = ship.groundY + groundHeight;
		ship.velocity.set(0, 0, 0);
	}

	mouse.update();

	light.position.copy(ship.position);
	light.position.y += 15;
	light.position.x += 0;
	light.target.position.copy(light.position);
	light.target.position.y -= 100;


	camera.position = {
		x: ship.position.x,
		y: ship.position.y + 4,
		z: ship.position.z + 15
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


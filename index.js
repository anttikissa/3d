// heightmap to buffer
//https://github.com/mrdoob/three.js/issues/1003

var frameCount = 0;

var world = require('./js/world');
var util = require('./js/util');
var timer = util.timer;
var log = util.log;
var logr = util.logr;

var heightData = world.heightData;

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
renderer.setClearColor(0x0, 1);

var camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
scene.add(camera);
camera.position = { x: -5, y: 5, z: 5 };
camera.lookAt(scene.position);

document.body.appendChild(renderer.domElement);
renderer.domElement.focus();





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
	hideInfo();

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

//	log("mouse delta", mouse.deltaX, mouse.deltaY);
};

function hideInfo() {
	var info = document.querySelector('.info');
	info.classList.add('hidden');
}

window.onmousedown = function(e) {
	if (!captureMouse) {
		hideInfo();
		captureMouse = true;
		lockPointer();
	}

	log(e);
}




//// Objects

// convert [0.255] to something suitable for playing
function convertHeight(orig) {
	return -20 + .08 * orig;
}

// How many patches to show around current one
// It's assumed that patchVisibility < 0.5 * splitInto
// (since it makes no sense otherwise)
var patchVisibility = 3;
var visualizePatches = false;

// This is the actual image size
var heightmapSize = 256;
// This is the part we use from it
var terrainN = 256;
// Size of patch
var patchSize = 32;
// How many patches per world (in one dimension)
var splitInto = terrainN / patchSize;

var shipStartPos = {
	x: /* terrainN / 2 + */ patchSize / 2,
	y: /* terrainN / 2 + */ patchSize / 2
}

// How far is the camera from the ship
var cameraDistance = 15;

// TODO move into a better place perhaps
var fogVisibility = patchVisibility * patchSize + cameraDistance;
scene.fog = new THREE.Fog(0x000000, .8 * fogVisibility, fogVisibility);

// x, y are heightmap coordinates
function getHeight(x, y) {
	// Eventually, support these
	if (x < 0)
		throw Error('x negative: ' + x);
	if (y < 0)
		throw Error('y negative: ' + x);
	x = Math.floor(x);
	x %= terrainN;
	y = Math.floor(y);
	y %= terrainN;
	return heightData[x + y * heightmapSize];
}

function terrainPatch(i, j) {
	var geometry = new THREE.PlaneGeometry(
		patchSize, patchSize, patchSize, patchSize);

	// Get the actual X coordinate (in the bigger heightmap)
	function getHeightmapX(k) {
		return k % (patchSize + 1) + i * patchSize;
	}
	// Get the actual Y coordinate (in the bigger heightmap)
	function getHeightmapY(k) {
		return Math.floor(k / (patchSize + 1)) + j * patchSize;
	}
	for (var k = 0; k < geometry.vertices.length; k++) {
		var x = getHeightmapX(k);
		var y = getHeightmapY(k);
		var h = getHeight(x, y);

		geometry.vertices[k].z += convertHeight(h);
	}

	function getColor(k, weight) {
		var x = getHeightmapX(k);
		var y = getHeightmapY(k);
		var h = getHeight(x, y);
		h *= 0.85;

		if (visualizePatches) {
			function normSin(value) {
				return 0.25 * (Math.sin(9 * value + 5)) + .75;
			}
			function normCos(value) {
				return 0.25 * (Math.cos(4 * value - 99)) + .75;
			}
			return new THREE.Color(
				(Math.floor(normSin(i * j * 5) * h) << 16) + 
				(Math.floor(normCos(i) * normSin(i + j) * h) << 8) +
				(Math.floor(normCos(j * 11))) * h);
		}

		return new THREE.Color((h << 16) + (h << 8) + h);
	}

	for (var k = 0; k < geometry.faces.length; k++) {
		var face = geometry.faces[k];

		face.vertexColors = [
			getColor(face.a),
			getColor(face.b),
			getColor(face.c)
		]
	}

	var material = new THREE.MeshBasicMaterial(
		{ wireframe: wireframe,
		  vertexColors: THREE.VertexColors });
	var plane = new THREE.Mesh(geometry, material);
	plane.position.x = (i + 0.5) * patchSize;
	plane.position.z = (j + 0.5) * patchSize;
	plane.rotation.x -= Math.PI / 2;
	plane.receiveShadow = true;

	scene.add(plane);

	return plane;
}

// Right now, terrain is an array of array of patches
function Terrain() {
	var pt = timer('terrain');

	var patches = []

	for (var i = 0; i < splitInto; i++) {
		patches.push([]);

		for (var j = 0; j < splitInto; j++) {
			var patch = terrainPatch(i, j);
			patches[i].push(patch);
		}
	}

	pt.stop();

	return patches;
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

	// TODO depthwrite doesn't work, really the objects should
	// always be rendered after the terrain
	var material = new THREE.MeshPhongMaterial({
		color: 0xffffff, wireframe: wireframe
		// uncomment for transparency
/*		, opacity: 0.5, 
		transparent: true, 
		depthWrite: true */
	});

	var ship = new THREE.Mesh(geometry, material);

	ship.groundY = shipGroundY;
	ship.position.y = shipGroundY + 0.02;
	ship.position.x = shipStartPos.x;
	ship.position.z = shipStartPos.y;
	ship.rotation.order = 'YXZ';

	ship.velocity = new THREE.Vector3(0, 0, 0);

	ship.castShadow = true;
	scene.add(ship);

	t.stop();
	return ship;
}

var terrain = Terrain();
var ship = Ship();

//// Light

function AmbientLight() {
	var light = new THREE.AmbientLight(0x888888);
	scene.add(light);
	return light;
}

function Light() {
	var light = new THREE.SpotLight(0xFFFFFF);
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

var ambientLight = AmbientLight();
var light = Light();



var ShipController = require('./js/ShipController').ShipController;
var shipController = ShipController(keys, mouse, ship);

var Particles = require('./js/Particles').Particles;
var particles = new Particles(scene);

function heightAt(x, y) {
	x = Math.floor(x);
	x = Math.min(Math.max(0, x), 256);
	y = Math.floor(y);
	y = Math.min(Math.max(0, y), 256);

	var origHeight = getHeight(x, y);
	var h = convertHeight(origHeight); 
	return h;
}

// Wrap objects around the world boundary if necessary
function scroll(o) {
	if (o.position.z < 0)
		o.position.z += terrainN;
	else
		o.position.z = o.position.z % terrainN;

	if (o.position.x < 0)
		o.position.x += terrainN;
	else
		o.position.x = o.position.x % terrainN;
}

function update() {
	util.frameCount++;

	shipController.update();
	particles.update();

	if (ship.accelerate) {
		log('accelerate');
	}

	scroll(ship);

	// Handle ship-ground collision
	var groundHeight = heightAt(ship.position.x, ship.position.z);
	if (ship.position.y < ship.groundY + groundHeight) {
		ship.position.y = ship.groundY + groundHeight;
		ship.velocity.set(0, 0, 0);

		ship.rotation.x = 0;
		ship.rotation.z = 0;
	}

	mouse.update();

	light.position.copy(ship.position);
	light.position.y += cameraDistance;
	light.position.x += 0;
	light.target.position.copy(light.position);
	light.target.position.y -= 100;

	var turningCamera = true;
	if (turningCamera) {
		var cameraPos = ship.back.clone();
		cameraPos.y = 0;
		cameraPos.normalize();
		cameraPos.multiplyScalar(15);
		cameraPos.y += 4;
		camera.position = ship.position.clone();
		camera.position.add(cameraPos);
	} else {
		camera.position = {
			x: ship.position.x,
			y: ship.position.y + 4,
			z: ship.position.z + 15
		};
	}

	camera.lookAt(ship.position);
}

// modulo distance of lhs and rhs
// i.e. moduloDist(0, 3, 4) == 1
// i.e. moduloDist(3, 0, 4) == 1
function moduloDist(a, b, modulus) {
	return Math.min(
		modulo(a - b, modulus),
		modulo(b - a, modulus));
}

function modulo(lhs, rhs) {
	if (lhs < 0)
		var result = (lhs % rhs) + rhs;
	else
		var result = lhs % rhs;

	return result;
}

function draw() {
	var currentPatch = {
		x: Math.floor(ship.position.x / patchSize),
		y: Math.floor(ship.position.z / patchSize)
	}

	var t = timer('draw', { r: true });
	var patchDrawCount = 0;

	// Set patches that are visible from block (i, j).
	// This includes patches visible across world boundary.
	// See comment about total waste of GPU resources below.
	function setVisiblePatches(x, y) {
		for (var i = 0; i < splitInto; i++) {
			for (var j = 0; j < splitInto; j++) {

				var dist = {
					x: moduloDist(x, i, splitInto),
					y: moduloDist(y, j, splitInto)
				}
				var maxDist = Math.max(dist.x, dist.y);
				if (maxDist <= patchVisibility) {
					terrain[i][j].visible = true;
					patchDrawCount++;
				} else {
					terrain[i][j].visible = false;
				}
			}
		}
	}

	setVisiblePatches(currentPatch.x, currentPatch.y);

	renderer.autoClear = true;

	function render(clear) {
		clear = clear || false;

		renderer.autoClear = clear;
		renderer.render(scene, camera);
	}

	render(true);
	var totalPatchDrawCount = patchDrawCount;

	var secondaryRenderOffsetX = 0;
	var secondaryRenderOffsetY = 0;
	if (currentPatch.x < patchVisibility)
		secondaryRenderOffsetX = -terrainN;
	if (splitInto - currentPatch.x <= patchVisibility)
		secondaryRenderOffsetX = terrainN;
	if (currentPatch.y < patchVisibility)
		secondaryRenderOffsetY = -terrainN;
	if (splitInto - currentPatch.y <= patchVisibility)
		secondaryRenderOffsetY = terrainN;

	var cameraPosOrig = camera.position.clone();

	var renderSecondaryX = secondaryRenderOffsetX !== 0;
	var renderSecondaryY = secondaryRenderOffsetY !== 0;

	// TODO this is wasteful -- at worst, it draws 4 times
	// as many patches as is needed.
	// To reduce amount of drawn patches, should call setVisiblePatches()
	// for each of the following if clauses with suitable options so that
	// it would select the correct patches to render.

	// Need to render scene again, offset along the x axis?
	if (renderSecondaryX) {
		camera.position.copy(cameraPosOrig);
		camera.position.x -= secondaryRenderOffsetX;
		render();
		totalPatchDrawCount += patchDrawCount;
	}

	// Need to render scene again, offset along the y axis?
	if (renderSecondaryY) {
		camera.position.copy(cameraPosOrig);
		camera.position.z -= secondaryRenderOffsetY;
		render();
		totalPatchDrawCount += patchDrawCount;
	}

	// Need to render scene again, offset along both axes (i.e. we're in the
	// corner of the world)
	if (renderSecondaryX && renderSecondaryY) {
		camera.position.copy(cameraPosOrig);
		camera.position.x -= secondaryRenderOffsetX;
		camera.position.z -= secondaryRenderOffsetY;
		render();
		totalPatchDrawCount += patchDrawCount;
	}

	logr('draw: drew ' + totalPatchDrawCount + ' patches.');
	t.stop();
}

function frame() {
	requestAnimationFrame(frame);
	update();
	draw();
}

frame();


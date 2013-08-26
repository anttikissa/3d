var width = window.innerWidth - 10;
var height = window.innerHeight - 10;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
var renderer = new THREE.WebGLRenderer(); 
renderer.setSize(width, height);

scene.add(camera);

function plane() {
	var n = 20;
	var geometry = new THREE.PlaneGeometry(n, n, n, n);
	var material = new THREE.MeshBasicMaterial(
		{ color: 0x00ff00, wireframe: true });
	var plane = new THREE.Mesh(geometry, material);
	plane.rotation.x += Math.PI / 2;

	scene.add(plane);
}

function ship() {
	var geometry = new THREE.CubeGeometry(1, 1, 1);
	var material = new THREE.MeshBasicMaterial(
		{ color: 0xff0000, wireframe: true });
	var ship = new THREE.Mesh(geometry, material);

	ship.position.y = 0.5;
	scene.add(ship);
}

plane();
ship();

camera.position.z = 15;
camera.position.y = 2;

document.body.appendChild(renderer.domElement);

function render() {
	requestAnimationFrame(render);
//	plane.rotation.y += 0.01;
	renderer.render(scene, camera);
}

render();

window.onkeyup = function(e) {
	console.log(e.keyCode);
}

window.onkeydown = function(e) {
	console.log(e.keyCode);
}

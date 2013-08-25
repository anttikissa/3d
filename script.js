console.log("Hello!");

window.onload = function() {
	init();
//	animate();
};

var camera, scene, renderer;
var geometry, material, mesh;

var width;
var height;

function init() {
	width = window.innerWidth - 10;
	height = window.innerHeight - 10;

	var viewAngle = 45;
	var aspect = width / height;
	var near = 0.1;
	var far = 10000;

	var container = document.body;

	var renderer = new THREE.WebGLRenderer();
	var camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);

	var scene = new THREE.Scene();

	scene.add(camera);
	camera.position.z = 300;

	renderer.setSize(width, height);
	container.appendChild(renderer.domElement);

	var radius = 50;
	var segments = 16;
	var rings = 16;

	var sphereMaterial = new THREE.MeshLambertMaterial({
		color: 0xCCCCCC,
//		wireframe: true
	});

	var sphere = new THREE.Mesh(
		new THREE.SphereGeometry(
			radius, segments, rings),
		sphereMaterial);

	var pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 130;
	scene.add(pointLight);

	scene.add(sphere);
	renderer.render(scene, camera);
}

/*
function init() {
	width = window.innerWidth - 10;
	height = window.innerHeight - 10;

	camera = new THREE.PerspectiveCamera(
		75, width / height, 1, 10000);

	camera.position.z = 1000;

	scene = new THREE.Scene();

	geometry = new THREE.CubeGeometry(200, 200, 200);
	material = new THREE.MeshBasicMaterial(
		{ color: 0xff0000, wireframe: true });

	mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

	renderer = new THREE.CanvasRenderer();
	renderer.setSize(width, height);

	document.body.appendChild(renderer.domElement);
}


function animate() {
	// note: three.js includes requestAnimationFrame shim
	requestAnimationFrame(animate);

	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;

	renderer.render(scene, camera);
	
}
*/

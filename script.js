console.log("Hello!");

window.onload = function() {
	init();
	animate();
};

var camera, scene, renderer;
var geometry, material, mesh;

var width;
var height;

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

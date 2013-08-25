var width = window.innerWidth - 10;
var height = window.innerHeight - 10;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
var renderer = new THREE.WebGLRenderer(); 
renderer.setSize(width, height);

scene.add(camera);

var geometry = new THREE.CubeGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
var cube = new THREE.Mesh(geometry, material);

scene.add(cube);

camera.position.z = 5;

document.body.appendChild(renderer.domElement);

function render() {
	requestAnimationFrame(render);
	cube.rotation.x += 0.04;
	cube.rotation.y += 0.04;
	renderer.render(scene, camera);
}

render();

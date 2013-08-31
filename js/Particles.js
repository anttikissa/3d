var THREE = require('three');
var log = require('./util').log;
var world = require('./world');

var particleCount = 100;
var current = 0;
// frames
var deathAge = 2000;

function Particles(scene) {
	this.scene = scene;

	if (!(this instanceof Particles)) {
		return new Particles();
	}

	this.particles = new THREE.Geometry(),
	this.material = new THREE.ParticleBasicMaterial({
		color: 0xffffff,
		size: 0.4
	});

	for (var p = 0; p < particleCount; p++) {
		var particle = new THREE.Vector3(0, 0, 0);
		particle.velocity = new THREE.Vector3(0, 0, 0);
		particle.age = deathAge;
		this.particles.vertices.push(particle);
	}

	this.system = new THREE.ParticleSystem(
		this.particles,
		this.material);
	
	this.scene.add(this.system);
}

Particles.prototype.update = function() {
	for (var i = 0; i < particleCount; i++) {
		var p = this.particles.vertices[i];
		if (p.age++ >= deathAge) {
			p.z = 1000;
			continue;
		}

		var h = world.convertHeight(world.getHeight(p.x, p.z));
//		log('height(' + p.x + ', ' + p.z + ' is', h);
		if (p.y < h) {
			p.y = h;
			p.velocity.multiply({ x: .8, y: -.8, z: .8 });
		}
		p.velocity.y -= 0.01;
		p.add(p.velocity);
	}
	this.particles.verticesNeedUpdate = true;
};

Particles.prototype.spawn = function(position, velocity) {
	var position = position || { x: 0, y: 0, z: 0 };
	var velocity = velocity || { x: 0, y: 0, z: 0 };
	var p = this.particles.vertices[current++];
	current = current % particleCount;

	p.copy(position);
	p.velocity.copy(velocity);
	p.age = 0;
};

module.exports.Particles = Particles;




module.exports.frameCount = 0;

function log() {
	console.log.apply(console, arguments);
}

// Log every two seconds
// r stands for...  I forgot.  Rarely?
function logr() {
	if ((module.exports.frameCount % 120) === 0) {
		console.log.apply(console, arguments);
	}
}

function timer(what, opts) {
	opts = opts || {}
	opts.r = opts.r || false;

	return {
		startTime: new Date(),
		stop: function() {
			var now = new Date();
			(opts.r ? logr : log)(what + " took " + (now - this.startTime) + " ms");
		}
	};
}

module.exports.log = log;
module.exports.logr = logr;
module.exports.timer = timer;


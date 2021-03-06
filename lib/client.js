var io = require('socket.io-client'),
    Gist = require('./gist');

function Client(endpoint) {
    this.endpoint = endpoint;
    this.gists = [];
    this.currentGist = null;
    this.firstConnection = true;
}

Client.prototype.connect = function() {
    if (!this.shouldConnect()) return;

    this.socket = io.connect(this.endpoint);

    var self = this;

    this.socket.on('connect', function() {
        if (!self.firstConnection) return;

        self.firstConnection = false;
        self.gists.forEach(function(gist){
           gist.addControls();
        });

    }).on('run', function(data) {
        self.currentGist.addOutput(data);
    });
}

Client.prototype.run = function(gist) {
    if (this.currentGist) this.currentGist.flush();

    this.currentGist = gist;
    this.socket.emit('run', {language: gist.language, code: gist.code});
}

// Shouldn't connect if there is no runnable gist
// check languages compatibility first
Client.prototype.shouldConnect = function() {
    return this.gists.length > 0;
}

Client.prototype.load = function(gistElements) {
    for (var index = 0; index < gistElements.length; index++) {
        var gist = new Gist(gistElements[index], this);

        if (gist.isValid()) this.gists.push(gist);
    }
}

module.exports = Client;

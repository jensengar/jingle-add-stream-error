var Jingle = require('jingle'),
    MediaSession = require('jingle-media-session'),
    _ = require('lodash');

var jingle1 = new Jingle();
var jingle2 = new Jingle();

function addSessionListeners(session, otherJingle, identifier) {
    session.on('change:connectionState', function(session, connectionState) {
        console.log(identifier + ' - ' + connectionState);
    });

    session.on('send', function (obj) {
        obj.from = identifier;
        if (obj.jingle.action !== 'transport-info') {
            console.log(identifier + ' - send - ' + obj.jingle.action + '  ---  ', obj);
        }
        otherJingle.process(obj);
    });
}

jingle1.on('*', function(type) {
    if (type !== 'send' && type.indexOf('log') < 0) {
        var args = ['jingle1 - '];
        _.forEach(arguments, function(arg) {
            args.push(arg);
        });

        console.log.apply(console, args);
    }

});

jingle2.on('*', function(type) {
    if (type !== 'send' && type.indexOf('log') < 0) {
        var args = ['jingle2 - '];
        _.forEach(arguments, function(arg) {
            args.push(arg);
        });

        console.log.apply(console, args);
    }
});

var session1 = new MediaSession({
    peer: 'session2'
});

addSessionListeners(session1, jingle2, 'session1');

var constraints1 = {
    video: true,
    audio: true,
    fake: true
};
var constraints2 = {
    video: true,
    audio: false,
    fake: true
};

var stream1, stream2;
navigator.mediaDevices.getUserMedia(constraints1).then(function(stream) {
    stream1 = stream;
    return navigator.mediaDevices.getUserMedia(constraints2);
}).then(function (stream) {
    stream2 = stream;


    jingle1.addSession(session1);
    session1.start();
    jingle2.on('incoming', function(session) {
        console.log('jingle2 - receiving session');
        addSessionListeners(session, jingle1, 'session2');
        session.addStream(stream2);
        session.accept();
    });

    session1.on('change:connectionState', function(session, connectionState) {
        if (connectionState === 'connected') {
            navigator.mediaDevices.getUserMedia(constraints1).then(function (stream) {
                session1.addStream2(stream);
            });
        }
    })

}).catch(function(error) {
    console.log('error:', error);
});

'use strict';

var app = require('./index');
var http = require('http');


var server;

/*
 * Create and start HTTP server.
 */

server = http.createServer(app);
server.listen(process.env.PORT || 8020);
server.on('listening', function () {
    console.log('Server listening on http://localhost:%d', this.address().port);
});

process.on('unhandledRejection', (reason, p) =>{
    console.error('Unhandled Rejection at: Promise ', p, ' Reason: ', reason);
});
process.on('uncaughtException', (err) =>{
    console.error('Uncaught Exception: ', err);
});

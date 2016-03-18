'use strict';
var stream = require('stream');
var util = require('util');

/***********************************************/
util.inherits(ReadableStream, stream.Readable);

function ReadableStream (data) {
    stream.Readable.call(this);
    this.push(data);
    this.push(null);
}

module.exports.ReadableStream = ReadableStream;

/***********************************************/
util.inherits(WritableStream, stream.Writable);

function WritableStream (options) {
    stream.Writable.call(this, options);
}

WritableStream.prototype.write = function() {
    var ret = stream.Writable.prototype.write.apply(this, arguments);
    if (!ret) this.emit('drain');
    return ret;
}

WritableStream.prototype._write = function(chunk, encoding, callback) {
    this.write(chunk, encoding, callback);
};

WritableStream.prototype.toString = function() {
    return this.toBuffer().toString();
};

WritableStream.prototype.toBuffer = function() {
    var buffers = [];
    this._writableState.getBuffer().forEach(function(data) {
        buffers.push(data.chunk);
    });
    return Buffer.concat(buffers);
};

module.exports.WritableStream = WritableStream;

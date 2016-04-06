'use strict';
var concat = require('concat-stream');
var Handlebars = require('handlebars');
var util = require('util');

module.exports = function bin(opts, cb) {

    opts.stdin.setEncoding('utf8');
    opts.stdin.on('error', handleError);
    opts.stdin.pipe(concat(applyTemplate));

    function applyTemplate(buf) {
        var template = buf.toString();
        var compile = Handlebars.compile(template);
        opts.stdout.write(compile(getVars()));
        cb && cb();
    }

    function handleError(err) {
        opts.stderr.write(util.format.call(null, err));
        cb && cb(err);
    }

    function getVars() {
        var vars = {};
        Object.keys(opts.env).forEach(function(key) {
            parseVar(vars, key, key);
        });
        return vars;
    }

    function parseVar(vars, keypart, key) {
        var arrRegexp = /^(.*?)_(\d+)_?(.*)$/g;
        var match = arrRegexp.exec(keypart);

        if (match) {
            if (!vars[match[1]]) {
                vars[match[1]] = [];
            }
            if (match[3]) {
                // ['PEOPLE_0_FIRST', 'PEOPLE', '0', 'FIRST']
                if (!vars[match[1]][match[2]]) {
                    vars[match[1]][match[2]] = {};
                }
                // Go deeper
                parseVar(vars[match[1]][match[2]], match[3], key);
            } else {
                // ['PEOPLE_0', 'PEOPLE', '0', '']
                vars[match[1]][match[2]] = opts.env[key];
            }
        } else {
            vars[keypart] = opts.env[key];
        }
    }
}

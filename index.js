'use strict';
var concat = require('concat-stream');
var Handlebars = require('handlebars');
var util = require('util');

module.exports = function envhandlebars(opts, cb) {
    // Defaults
    if (!cb && typeof opts === 'function') {
        cb = opts;
        opts = {};
    }
    opts = opts || {};
    opts.env = opts.env || process.env;
    opts.exit = opts.exit || process.exit;
    opts.stdin = opts.stdin || process.stdin;
    opts.stdout = opts.stdout || process.stdout;
    opts.stderr = opts.stderr || process.stderr;
    opts.arraysEnabled = typeof opts.arraysEnabled === 'undefined' ? true : opts.arraysEnabled;
    opts.arrayVarPrefix = opts.arrayVarPrefix || false;

    cb = cb || function(err) {
        if (err) {
            opts.stderr.write(util.format.call(null, err));
            opts.exit(1);
        }
    };

    // Allow helpers or other extensions to be applied
    if (typeof opts.extendHandlebars === 'function') {
        opts.extendHandlebars(Handlebars);
    }

    // Stream stdin through handlebars template procesing
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
        if (!opts.arraysEnabled) {
            return opts.env;
        }
        var vars = {};
        Object.keys(opts.env).forEach(function(key) {
            parseVar(vars, key, key);
        });
        return vars;
    }

    function parseVar(vars, keypart, key) {
        var arrPatternPrefix = '^(.*?)_';
        if (keypart === key && opts.arrayVarPrefix) {
            // recursive - only check prefix on first run
            arrPatternPrefix = '^(' + opts.arrayVarPrefix + '.*?)_'
        }
        var arrPattern = '(\\d+)_?(.*)$';
        var arrRegexp = new RegExp(arrPatternPrefix + arrPattern, 'g')
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

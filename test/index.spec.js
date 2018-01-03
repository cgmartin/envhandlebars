/* global it, describe, beforeEach */
'use strict';
var assert = require('assert');
var stream = require('../test-helpers/stream-mocks');
var path = require('path');

describe('envhandlebars', function() {
    var fixture = require('../index.js');
    var stdout;
    var stderr;
    var argv;

    beforeEach(function() {
        stdout = new stream.WritableStream();
        stderr = new stream.WritableStream();
        argv = [
            'node',
            path.join(__dirname, "../bin/envhandlebars")
        ];
    });

    describe('basic expressions', function () {
        it('should render simple expressions', function (done) {
            var stdin = new stream.ReadableStream(
                "Hello {{WORLD}}! {{FIRST_NAME}}"
            );
            fixture({
                env: { WORLD: 'world', FIRST_NAME: 'first name' },
                stdin: stdin, stdout: stdout, stderr: stderr,
                argv: argv
            }, function (err) {
                assert.ifError(err);
                assert.equal(stdout.toString(), 'Hello world! first name');
                done();
            });
        });
    });

    describe('if expressions', function () {
        it('should render if var exists', function (done) {
            var stdin = new stream.ReadableStream(
                "{{#if WORLD}}Hello {{WORLD}}{{/if}}!"
            );
            fixture({
                env: { WORLD: 'world' },
                stdin: stdin, stdout: stdout, stderr: stderr,
                argv: argv
            }, function (err) {
                assert.ifError(err);
                assert.equal(stdout.toString(), 'Hello world!');
                done();
            });
        });
        it('should not render if var missing', function (done) {
            var stdin = new stream.ReadableStream(
                "{{#if WORLD}}Hello {{WORLD}}{{/if}}!"
            );
            fixture({
                env: { },
                stdin: stdin, stdout: stdout, stderr: stderr,
                argv: argv
            }, function (err) {
                assert.ifError(err);
                assert.equal(stdout.toString(), '!');
                done();
            });
        });
    });

    describe('iterator expressions', function () {
        it('should not render array of strings', function (done) {
            var stdin = new stream.ReadableStream(
                "{{#each PEOPLE}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}!"
            );
            fixture({
                env: {
                    PEOPLE_0: 'Chris',
                    PEOPLE_1: 'John',
                    PEOPLE_2: 'Shayne'
                },
                stdin: stdin, stdout: stdout, stderr: stderr,
                argv: argv.concat(['--no_arrays'])
            }, function (err) {
                assert.ifError(err);
                assert.equal(stdout.toString(), '!');
                done();
            });
        });
        it('should render array of strings', function (done) {
            var stdin = new stream.ReadableStream(
                "{{#each PEOPLE}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}!"
            );
            fixture({
                env: {
                    PEOPLE_0: 'Chris',
                    PEOPLE_1: 'John',
                    PEOPLE_2: 'Shayne'
                },
                stdin: stdin, stdout: stdout, stderr: stderr,
                argv: argv
            }, function (err) {
                assert.ifError(err);
                assert.equal(stdout.toString(), 'Chris, John, Shayne!');
                done();
            });
        });
        it('should render array of objects', function (done) {
            var stdin = new stream.ReadableStream(
                "{{#each PEOPLE}}{{FIRST}} {{LAST}}{{#unless @last}}, {{/unless}}{{/each}}!"
            );
            fixture({
                env: {
                    PEOPLE_0_FIRST: 'Chris',  PEOPLE_0_LAST: 'Martin',
                    PEOPLE_1_FIRST: 'John',   PEOPLE_1_LAST: 'Papa',
                    PEOPLE_2_FIRST: 'Shayne', PEOPLE_2_LAST: 'Boyer',
                },
                stdin: stdin, stdout: stdout, stderr: stderr,
                argv: argv
            }, function (err) {
                assert.ifError(err);
                assert.equal(stdout.toString(), 'Chris Martin, John Papa, Shayne Boyer!');
                done();
            });
        });
        it('should render array of object arrays', function (done) {
            var stdin = new stream.ReadableStream(
                "{{#each CLUSTERS}}{{NAME}} > " +
                    "{{#each SERVICES}}{{NAME}}{{#unless @last}},{{/unless}}{{/each}}" +
                "{{#unless @last}}; {{/unless}}{{/each}}!"
            );
            fixture({
                env: {
                    CLUSTERS_0_NAME: 'c1',
                    CLUSTERS_0_SERVICES_0_NAME: 'c1s1',
                    CLUSTERS_0_SERVICES_1_NAME: 'c1s2',
                    CLUSTERS_1_NAME: 'c2',
                    CLUSTERS_1_SERVICES_0_NAME: 'c2s1',
                    CLUSTERS_1_SERVICES_1_NAME: 'c2s2'
                },
                stdin: stdin, stdout: stdout, stderr: stderr,
                argv: argv
            }, function (err) {
                assert.ifError(err);
                assert.equal(stdout.toString(), 'c1 > c1s1,c1s2; c2 > c2s1,c2s2!');
                done();
            });
        });
    });

    describe('handlebars extensions', function () {
        it('should register helper', function (done) {
            var stdin = new stream.ReadableStream(
                "Hello {{fullName FIRST_NAME LAST_NAME}}"
            );
            function registerHelpers(Handlebars) {
                Handlebars.registerHelper('fullName', function(first, last) {
                    return last + ', ' + first;
                });
            }

            fixture({
                env: { FIRST_NAME: 'first', LAST_NAME: 'last' },
                stdin: stdin, stdout: stdout, stderr: stderr,
                argv: argv,
                extendHandlebars: registerHelpers
            }, function (err) {
                assert.ifError(err);
                assert.equal(stdout.toString(), 'Hello last, first');
                done();
            });
        });
    });

});

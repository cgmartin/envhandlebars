var concat = require('concat-stream');
var Handlebars = require('handlebars');

process.stdin.on('error', handleError);
process.stdin.pipe(concat(applyTemplate));

function applyTemplate(buf) {
    var template = buf.toString();
    var compile = Handlebars.compile(template);
    process.stdout.write(compile(process.env));
}

function handleError(err) {
    console.error(err);
    process.exit(1);
}

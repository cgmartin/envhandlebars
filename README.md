envhandlebars
=============

[![Dependency Status](https://david-dm.org/cgmartin/envhandlebars.svg)](https://david-dm.org/cgmartin/envhandlebars)
[![npm version](https://badge.fury.io/js/envhandlebars.svg)](http://badge.fury.io/js/envhandlebars)
[![Build Status](https://travis-ci.org/cgmartin/envhandlebars.svg?branch=master)](https://travis-ci.org/cgmartin/envhandlebars)

A simple templating utility, akin to [`envsubst`](http://linuxcommand.org/man_pages/envsubst1.html), but using [Handlebars](http://handlebarsjs.com/) for more complex logic.

Environment variables are used as the data input to a Handlebars template:
```
$ export NAME=world
$ echo "Hello {{NAME}}" | envhandlebars
Hello world
```

This is particularly useful for dynamic configuration files in Docker containers and other [12-Factor applications](http://12factor.net/).

## Install

```
$ npm install -g envhandlebars
```

## Usage

Redirect a Mustache template file into stdin of `envhandlebars` and redirect the rendered stdout to a file:
```
$ envhandlebars < templatefile > renderedfile
```

## Complex Examples

### Conditionals

Mustache conditionals can be used as is...

Template:
```
{{#if WORLD}}Hello {{WORLD}}{{/if}}!
```

Env vars:
```bash
WORLD=world
```

Output:
```
Hello world!
```

See the [if block helper](http://handlebarsjs.com/builtin_helpers.html#conditionals) docs page for more information.


### Iterators

Mustache iterators require using a special environment variable naming convention...

**Array of strings**

Template:
```
{{#each PEOPLE}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}!
```

Env vars:
```bash
# Convention: {VARNAME}_{INDEX}
PEOPLE_0=Chris
PEOPLE_1=John
PEOPLE_2=Shayne
```

Output:
```
Chris, John, Shayne!
```

**Array of objects**

Template:
```
{{#each PEOPLE}}{{FIRST}} {{LAST}}{{#unless @last}}, {{/unless}}{{/each}}!
```

Env vars:
```bash
# Convention: {VARNAME}_{INDEX}_{PROPERTY}
PEOPLE_0_FIRST=Chris
PEOPLE_0_LAST=Martin
PEOPLE_1_FIRST=John
PEOPLE_1_LAST=Papa
PEOPLE_2_FIRST=Shayne
PEOPLE_2_LAST=Boyer
```

Output:
```
Chris Martin, John Papa, Shayne Boyer!
```

See the [each block helper](http://handlebarsjs.com/builtin_helpers.html#iteration) docs page for more information.
You can disable this behaviour by passing the option `--no_arrays` to the `envhandlebars` command if you have env variables that conflict with this convention and you don't want to use iterators.

## Docker Usage

To generate configuration dynamically within a docker container, `envhandlebars` can be used before the main process starts. It can be done in the `CMD` or within a wrapper script.

Here is an example docker-compose.yml for a custom nginx container:
```
nginx:
  build: .
  volumes:
   - ./mysite.template:/etc/nginx/conf.d/mysite.template
  ports:
   - "8080:80"
  environment:
   - NGINX_HOST=foobar.com
   - NGINX_PORT=80
  command: /bin/bash -c "envhandlebars < /etc/nginx/conf.d/mysite.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
```

The mysite.template file may then contain variable references like this:
```
listen {{NGINX_PORT}};
```

You just need to make sure to install Node.js and envhandlebars (via npm) within your custom Dockerfile.

For debian-based images:
```
RUN apt-get update && apt-get install -y nodejs && npm i -g envhandlebars
```

For alpine-based images:
```
RUN apk add --update nodejs && npm i -g envhandlebars
```

## Custom Helpers or Partials

**(New in v1.3.0+)**

Custom Mustache helpers and partials can be implemented by extending the `envhandlebars` module with your own Node.js wrapper script:

```javascript
#!/usr/bin/env node
// Script: `myenvhandlebars`
'use strict';
var envhandlebars = require('envhandlebars');

// The Handlebars context is passed into this function
// for registering helpers, partials or other extensions.
function extendHandlebars(Handlebars) {
    Handlebars.registerHelper('fullName', function(first, last) {
        return last + ', ' + first;
    });
}

envhandlebars({
    extendHandlebars: extendHandlebars
});
```

See the [custom helpers](http://handlebarsjs.com/#helpers) docs page for more information.

## License

[MIT License](http://cgm.mit-license.org/)

envhandlebars
=============

A simple templating utility, akin to [`envsubst`](http://linuxcommand.org/man_pages/envsubst1.html), but using [Handlebars](http://handlebarsjs.com/) for more complex logic.

Particularly useful for dynamic configuration in Docker containers.

[![Dependency Status](https://david-dm.org/cgmartin/envhandlebars.svg)](https://david-dm.org/cgmartin/envhandlebars)
[![npm version](https://badge.fury.io/js/envhandlebars.svg)](http://badge.fury.io/js/envhandlebars)

Environment variables are used as the data input to a Handlebars template:
```
$ export WORLD=world
$ echo "Hello {{WORLD}}" | envhandlebars
Hello world
```

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

See the [if block helper](http://handlebarsjs.com/builtin_helpers.html#conditionals) for more information.

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

See the [each block helper](http://handlebarsjs.com/builtin_helpers.html#iteration) for more information.

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

## License

[MIT License](http://cgm.mit-license.org/)

envhandlebars
=============

A simple templating utility, akin to [`envsubst`](http://linuxcommand.org/man_pages/envsubst1.html), but using [Handlebars](http://handlebarsjs.com/) for more complex logic. Particularly useful with Docker containers.

Environment variables are used as the data input to a Handlebars template:
```
$ envhandlebars < templatefile > renderedfile
```

# Install

```
$ npm install -g envhandlebars
```

# Usage

```
$ export WORLD=world
$ echo "Hello {{WORLD}}" | envhandlebars
Hello world
```

Or from a template file:
```
$ envhandlebars < templatefile > renderedfile
```

# License

[MIT License](http://cgm.mit-license.org/)

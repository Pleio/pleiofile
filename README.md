Pleiofile
=========
This plugin provides file and folder management for Elgg 1.8 in Groups. Install the plugin in conjunction with the file plugin (provided with Elgg). This plugin depends on [React.js](https://facebook.github.io/react/), [React-bootstrap](https://react-bootstrap.github.io/) and [Immutable.js](https://facebook.github.io/immutable-js/).

![Image of Pleiofile](https://cloud.githubusercontent.com/assets/5213690/12142075/9e56dc54-b475-11e5-8c9f-1402fafd1d35.png)

Development
-----------
Javascript dependency management is managed by NPM. To install the dependencies (for development purposes) run:

    npm install

For live reloading use

    gulp watch

and for re-building a minified version use

    gulp build

There is also a git pre-commit hook that builds a minified version before a commit.

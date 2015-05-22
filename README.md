# Geo Tales mobile website

Current status: Prototype

## Building the website

If you don't have it, install [node.js](http://nodejs.org).

Install the required dependencies:

    $ npm install

Building the website:

    $ npm run build

You need a web server to test the application. If you don't have one at hand,
install `http-server` and let it ship the `public` directory:

    $ npm install http-server -g
    $ http-server public

Then open <http://localhost:8080> in your browser.

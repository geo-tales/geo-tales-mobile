# Geo Tales mobile website

Current status: Prototype

## Building the website

If you don't have it, install [node.js](http://nodejs.org).

Install the required dependencies:

    $ npm install

Building the website:

    $ npm run build

Running the website locally:

    $ npm start

Then open <http://localhost:8080> in your browser.

## Building stories

To load a story locally, put a `my-story.json` file in the `public` directory.
Then open <http://localhost:8080?story=my-story.json>

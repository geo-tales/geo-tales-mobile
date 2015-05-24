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

To load a story locally, put a `my-story.json` file in the `public` directory
and open <http://localhost:8080?story=my-story.json>

## Story file format

Stories are described in JSON files. An example can be found in
`public/all-screens.json`. Each JSON file must contain exactly one JSON object
with these properties:

- `locations`: An object defining locations where the key is the identifyer of
  the location and the value is an object defining the location:
    - `type`: A string defining the location type. Can be `circle` or
      `polygon`. The other valid fields of the object depend on the type.
- `screens`: An object defining screens where the key is the identifyer of the
  screen and the value is an object defining the screen:
    - `type`: A string defining the screen type. Can be `text`, `choices`,
      `navigate` and `finish`. The other valid fields of the object depend on
      the type.
- `demo`: Optional flag to enable "demo" mode. Defaults to `false`.

### Locations

`type: "circle"`

- `center`: The center of a circle consisting of:
    - `latitude`: Number
    - `longitude`: Number
- `radius`: Number defining the radius of the circle in meters.

`type: "polygon"`

- `coords`: An array of coordinates describing the polygon, each consisting of:
    - `latitude`: Number
    - `longitude`: Number

### Screens

`type: "text"`

- `text`: Markdown to show as the text. Use `##` for headings.
- `next`: The ID of the next screen to show.

`type: "choices"`

- `text`: Markdown to show as the text. Use `##` for headings.
- `choices`: An array of choice definitions consisting of:
    - `text`: Markdown to show as the option text.
    - `points`: Optional points that are added to the users credit when this
      option is selected.
    - `next`: Optional screen ID to show when this option is selected.
- `next`: The ID of the next screen to show in case no screen was defined in
  the selected choice.

`type: "navigate"`

- `location`: The ID of the location to navigate to.
- `options`: Optional object with these optional properties:
    - `compass`: Whether to show the compass. Defaults to `true`.
    - `distance`: Whether to show the distance. Defaults to `true`.
    - `colorSteps`: When specified, the background color will show warmer
      colors the closer the device gets to the target location. Specifies the
      distance in meters that the device has to be moved in order to cause the
      color to change.
- `next`: The ID of the next screen to show once the location has been reached.

`type: "finish"`

- `text`: Optional markdown to show as the text. Defaults to
  "Congratulations! You have reached to end of the story.".

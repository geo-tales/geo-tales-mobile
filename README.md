# Geo Tales mobile website

Current status: Beta

## Building stories

The mobile web app is available at <http://geo-tales.github.io/mobile-app/>. To
create a story, create a JSON file with the format described below. You can
publish the file as a public or a secret at <https://gist.github.com>. To
play the story, open the mobile web app with the JSON files "raw" URL like
this:

    http://geo-tales.github.io/mobile-app/?story={gist-json-file-raw-url}

## Story file format

Check out [the tour.json file][tour] for an example.

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

There must be one location with the ID `"start"`. This marks the place where
the player has to be in order to start the story.

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

There must be one screen with the ID `"start"`. This marks the screen that
starts the story.

`type: "text"`

Displays rich text telling a part of the story with a button to proceed to the
next screen.

- `text`: Markdown to show as the text. Use `##` for headings.
- `next`: The ID of the next screen to show.

`type: "input"`

Displays rich text and an input box. The player has to provide the correct
answer to be allowed to proceed to the next screen.

- `text`: Markdown to show as the text. Use `##` for headings.
- `answer`: The correct answer.
- `next`: The ID of the next screen to show.

`type: "choices"`

Displays rich text and a list of choices. Depending on the choice the player
may receive points can continue to another screen. The "next" button is only
shown if an option has been selected.

- `text`: Markdown to show as the text. Use `##` for headings.
- `choices`: An array of choice definitions consisting of:
    - `text`: Markdown to show as the option text.
    - `points`: Optional points that are added to the users credit when this
      option is selected.
    - `next`: Optional screen ID to show when this option is selected.
- `next`: The ID of the next screen to show in case no screen was defined in
  the selected choice.

`type: "navigate"`

Directs the player to another location. By default, this screen shows an arrow
pointing in the direction of the location and the distance in meters. It can
optionally change the background color with warmer colors indicating being
closer to the location. The compass arrow and the distance can be hidden to
only show the background color.

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

Each story must have at least one "finish" screen. Displays rich text, the time
the player needed to finish the story and the points, if any where collected.

- `text`: Optional markdown to show as the text. Defaults to
  "Congratulations! You have reached to end of the story.".

## Building the mobile application

You don't need to build the app yourself. You can use the latest version on
the geo-tales website. If you want to help on improving the web application,
keep reading.

If you don't have it, install [node.js][].

Install the required dependencies:

    $ npm install

Building the website:

    $ npm run build

Running the website locally:

    $ npm start

Then open <http://localhost:8080> in your browser.

To load a story locally, put a `my-story.json` file in the `public` directory
and open <http://localhost:8080?story=my-story.json>

[tour]: https://github.com/geo-tales/geo-tales-mobile/blob/master/public/tour.json
[node.js]: http://nodejs.org

# Changes

## 0.0.13

- Avoid opening a browser on local navigation in PWA
- Add app title, status bar style and icons

## 0.0.12

- Update locatify and fix tests accordingly

## 0.0.11

- Use Studio Changes for releases
- Upgrade sinon to v5
- Modernize browserify setup
- Switch to eslint and update to ES6
- Remove argument passed to locatify
- Use https URLs for mobile app since location API requires it
- Upgrade mochify and ajust tests

## 0.0.10

- Fixes for Android
- Do not attempt to restore a story if no screen was saved yet
- Show error message if location tracking does not work
- Don't apply negative deg
- Show message after timeout if no location data is received

## 0.0.9

- Build with fix in locatify

## 0.0.8

- Move animation code to separate [animatify][] module
- Move error message display out of location-tracker
- Move location-tracket to separate [locatify][] module

[animaitfy]: https://github.com/mantoni/animatify.js
[locatify]: https://github.com/mantoni/locatify.js

## 0.0.7

- Add google analytics tracking code

## 0.0.6

- Add default screen
- Move `default.json` to `tour.json`

## 0.0.5

- Save and restore screen, points and startTime
- Add screen that asks whether to discard or continue the last story
- Improve file format documentation and instructions for building stories

## 0.0.4

- Prevent user text selection on iOS
- Add support for mobile web app
- Use input `type="number"` if answer is a numeric value

## 0.0.3

- Require good accuracy to detect whether navigation position is in shape
- Assert that all locations and screens are used at least once

## 0.0.2

- Implement start screen
- Implement input screen
- Require start location
- Always go back to the start screen after the end of a story

## 0.0.1

- Initial release

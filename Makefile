SHELL := /bin/bash

version = $(shell node -p "require('./package.json').version")

default:
	npm test

install:
	rm -rf node_modules
	npm install

release:
	rm -f public/*.{js,css}
	npm run release
	git tag -a -m "Release ${version}" v${version}
	git push --follow-tags

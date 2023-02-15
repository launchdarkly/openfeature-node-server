# Change log

All notable changes to the LaunchDarkly OpenFeature provider for the Server-Side SDK for Node.js will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org).

## [0.2.0] - 2023-02-15
This version adds support for contexts. For a detailed explanation of contexts please refer to the [node-server-sdk 7.0.0 release notes.](https://github.com/launchdarkly/node-server-sdk/releases/tag/7.0.0) The README contains a number of examples demonstrating how to use contexts.

### Changed:
- Upgraded to the `node-server-sdk` version `7.0.1`.

## [0.1.6] - 2022-10-19
### Changed:
- Updated to the OpenFeature `js-sdk` version `1.0.0`. (Thanks, [@beeme1mr](https://github.com/launchdarkly/openfeature-node-server/pull/14)!)

## [0.1.5] - 2022-10-18
### Added:
- Added CHANGELOG.md

### Changed:
- Updated to OpenFeature `js-sdk` `0.5.1`.

## [0.1.3] - 2022-10-07
### Changed:
- Added an `npmignore` file so that dist can be included in the release, and src excluded.

## [0.1.2] - 2022-10-07
### Changed:
- Updated the scripts to include building with `prepublishOnly`.

## [0.1.1] - 2022-10-07
### Fixed:
- Updated `@openfeature/js-sdk` dependency be consistently `0.5.0`.

## [0.1.0] - 2022-10-07
Initial beta release of the LaunchDarkly OpenFeature provider for the Server-Side SDK for Node.js.

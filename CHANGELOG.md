# Change log

All notable changes to the LaunchDarkly OpenFeature provider for the Server-Side SDK for Node.js will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org).

## [1.0.0](https://github.com/launchdarkly/openfeature-node-server/compare/openfeature-node-server-v0.6.3...openfeature-node-server-v1.0.0) (2024-06-07)


### ⚠ BREAKING CHANGES

* 1.0 Release ([#47](https://github.com/launchdarkly/openfeature-node-server/issues/47))

### Features

* 1.0 Release ([#47](https://github.com/launchdarkly/openfeature-node-server/issues/47)) ([eb43d70](https://github.com/launchdarkly/openfeature-node-server/commit/eb43d70955bc67cf660bbfa5a30da411636aeddb))

## [0.6.3](https://github.com/launchdarkly/openfeature-node-server/compare/openfeature-node-server-v0.6.2...openfeature-node-server-v0.6.3) (2024-06-04)


### Bug Fixes

* Revert to CommonJS until esbuild is added. ([#45](https://github.com/launchdarkly/openfeature-node-server/issues/45)) ([294b627](https://github.com/launchdarkly/openfeature-node-server/commit/294b627208d2a134900f3429e0892d5847752b83))

## [0.6.2](https://github.com/launchdarkly/openfeature-node-server/compare/openfeature-node-server-v0.6.1...openfeature-node-server-v0.6.2) (2024-06-04)


### Bug Fixes

* Add repository to package.json for provenance. ([#43](https://github.com/launchdarkly/openfeature-node-server/issues/43)) ([d4b188d](https://github.com/launchdarkly/openfeature-node-server/commit/d4b188d55ed2a478d0549c999c16a892093c1b3d))

## [0.6.1](https://github.com/launchdarkly/openfeature-node-server/compare/openfeature-node-server-v0.6.0...openfeature-node-server-v0.6.1) (2024-06-04)


### Bug Fixes

* Make publish script executable. ([#41](https://github.com/launchdarkly/openfeature-node-server/issues/41)) ([86b2ca7](https://github.com/launchdarkly/openfeature-node-server/commit/86b2ca7cc5e3d83e15b558653df3fe896084c1e0))

## [0.6.0](https://github.com/launchdarkly/openfeature-node-server/compare/openfeature-node-server-v0.5.1...openfeature-node-server-v0.6.0) (2024-06-04)


### Features

* Require node 18 or greater. ([05e4b2d](https://github.com/launchdarkly/openfeature-node-server/commit/05e4b2d74927ecfb3c7d8274bfd914bb6985cb92))
* Update to OpenFeature SDK 1.14.0. ([05e4b2d](https://github.com/launchdarkly/openfeature-node-server/commit/05e4b2d74927ecfb3c7d8274bfd914bb6985cb92))

## [0.5.1] - 2023-11-01
### Changed:
- Changed the reported wrapper name. This has no impact on functionality.

## [0.5.0] - 2023-10-30
This version contains a breaking change. If you upgrade to this version, then you will also need to update the `@launchdarkly/node-server-sdk`, and `@openfeature/server-sdk` packages. Additionally code changes will be required because of the new method of constructing the provider. Refer to the README for an updated code sample.

### Changed:
- Changed the way that the `LaunchDarklyProvider` is instantiated. Now the `LDClient` is managed by the `LaunchDarklyProvider`. If you need to access the `LDClient` directly you can use the `getClient()` method of the provider.
- Updated to use the `@launchdarkly/node-server-sdk` version `9.0.1` or higher.
- Update to use `@openfeature/server-sdk` version `1.6.3`. The open feature SDK was renamed from `@openfeature/js-sdk`.

## [0.4.0] - 2023-07-26
This version contains a breaking change. If you upgrade to this version, then you will also need to update to the `@launchdarkly/node-server-sdk` package.

### Changed:
- Updated to use the `@launchdarkly/node-server-sdk`.

## [0.3.0] - 2023-03-14
### Fixed:
- Include typescript type declarations in release package.

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

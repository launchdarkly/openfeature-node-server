# LaunchDarkly OpenFeature provider for the Server-Side SDK for Node.js

This provider is designed primarily for use in multi-user systems such as web servers and applications. It follows the server-side LaunchDarkly model for multi-user contexts. It is not intended for use in desktop and embedded systems applications.

# LaunchDarkly overview

[LaunchDarkly](https://www.launchdarkly.com) is a feature management platform that serves over 100 billion feature flags daily to help teams build better software, faster. [Get started](https://docs.launchdarkly.com/home/getting-started) using LaunchDarkly today!

[![Twitter Follow](https://img.shields.io/twitter/follow/launchdarkly.svg?style=social&label=Follow&maxAge=2592000)](https://twitter.com/intent/follow?screen_name=launchdarkly)

## Supported Node versions

This version of the LaunchDarkly OpenFeature provider is compatible with Node.js versions 16 and above.

## Getting started

### Installation

```
npm install @openfeature/nodejs-sdk
npm install launchdarkly-node-server-sdk
npm install @launchdarkly/open-feature-node
```

### Usage
```
import { OpenFeature } from '@openfeature/nodejs-sdk';
import { init } from 'launchdarkly-node-server-sdk';
import { LaunchDarklyProvider } from 'open-feature-node';


const ldClient = init('<your-sdk-key>');
await ldClient.waitForInitialization();
OpenFeature.setProvider(new LaunchDarklyProvider(ldClient));
const value = await client.getBooleanDetails('app-enabled', false, {targetingKey: 'my-key'});
```

Refer to the [SDK reference guide](https://docs.launchdarkly.com/sdk/server-side/node-js) for instructions on getting started with using the SDK.

## OpenFeature Specific Considerations

When evaluating an `LDUser` with the node client a string `key` attribute would normally be required. When using OpenFeature the `targetingKey` attribute should be used instead of `key`. If a `key` attribute is provided in the `EvaluationContext`, then it will be discarded in favor of `targetingKey`. If a `targetingKey` is not provided, or if the `EvaluationContext` is omitted entirely, then the `defaultValue` will be returned from OpenFeature evaluation methods.

Other fields normally included in an `LDUser` may be added to the `EvaluationContext`. Any `custom` attributes can
be added to the top level of the evaluation context, and they will operate as if they were `custom` attributes on an `LDUser`. Attributes which are typically top level on an `LDUser` should be of the same types that are specified for
an `LDUser` or they will not operate as intended.

If a top level `custom` attribute is defined on the `EvaluationContext`, then that will be a `custom` attribute inside `custom` for an `LDUser`.

If a custom attribute is provided, whose value is an object, then that attribute will be discarded.

## Learn more

Check out our [documentation](http://docs.launchdarkly.com) for in-depth instructions on configuring and using LaunchDarkly. You can also head straight to the [complete reference guide for this SDK](https://docs.launchdarkly.com/sdk/server-side/node-js).

The authoritative description of all properties and methods is in the [TypeScript documentation](https://launchdarkly.github.io/node-server-sdk/).

## Contributing

We encourage pull requests and other contributions from the community. Check out our [contributing guidelines](CONTRIBUTING.md) for instructions on how to contribute to this SDK.

## About LaunchDarkly

* LaunchDarkly is a continuous delivery platform that provides feature flags as a service and allows developers to iterate quickly and safely. We allow you to easily flag your features and manage them from the LaunchDarkly dashboard.  With LaunchDarkly, you can:
    * Roll out a new feature to a subset of your users (like a group of users who opt-in to a beta tester group), gathering feedback and bug reports from real-world use cases.
    * Gradually roll out a feature to an increasing percentage of users, and track the effect that the feature has on key metrics (for instance, how likely is a user to complete a purchase if they have feature A versus feature B?).
    * Turn off a feature that you realize is causing performance problems in production, without needing to re-deploy, or even restart the application with a changed configuration file.
    * Grant access to certain features based on user attributes, like payment plan (eg: users on the ‘gold’ plan get access to more features than users in the ‘silver’ plan). Disable parts of your application to facilitate maintenance, without taking everything offline.
* LaunchDarkly provides feature flag SDKs for a wide variety of languages and technologies. Check out [our documentation](https://docs.launchdarkly.com/sdk) for a complete list.
* Explore LaunchDarkly
    * [launchdarkly.com](https://www.launchdarkly.com/ "LaunchDarkly Main Website") for more information
    * [docs.launchdarkly.com](https://docs.launchdarkly.com/  "LaunchDarkly Documentation") for our documentation and SDK reference guides
    * [apidocs.launchdarkly.com](https://apidocs.launchdarkly.com/  "LaunchDarkly API Documentation") for our API documentation
    * [blog.launchdarkly.com](https://blog.launchdarkly.com/  "LaunchDarkly Blog Documentation") for the latest product updates

# LaunchDarkly OpenFeature provider for the Server-Side SDK for Node.js

This provider allows for using LaunchDarkly with the OpenFeature JS SDK.

This provider is designed primarily for use in multi-user systems such as web servers and applications. It follows the server-side LaunchDarkly model for multi-user contexts. It is not intended for use in desktop and embedded systems applications.

# LaunchDarkly overview

[LaunchDarkly](https://www.launchdarkly.com) is a feature management platform that serves trillions of feature flags daily to help teams build better software, faster. [Get started](https://docs.launchdarkly.com/home/getting-started) using LaunchDarkly today!

[![Twitter Follow](https://img.shields.io/twitter/follow/launchdarkly.svg?style=social&label=Follow&maxAge=2592000)](https://twitter.com/intent/follow?screen_name=launchdarkly)

## Supported Node versions

This version of the LaunchDarkly OpenFeature provider is compatible with Node.js versions 18 and above.

## Getting started

### Installation

```
npm install @openfeature/server-sdk
npm install @launchdarkly/node-server-sdk
npm install @launchdarkly/openfeature-node-server
```

### Usage
```
import { OpenFeature } from '@openfeature/server-sdk';
import { LaunchDarklyProvider } from '@launchdarkly/openfeature-node-server';

// The LaunchDarkly provider will use a 10 second timeout by default when waiting for the SDK
// to initialize. This can be controlled by the optional third parameter to the LaunchDarklyProvider
// constructor.
const ldProvider = new LaunchDarklyProvider('<your-sdk-key>', {/* LDOptions here */});

OpenFeature.setProvider(ldProvider);

// Alternatively await OpenFeature.setProviderAndWait(ldProvider); can be used.
// This eliminated the need to listen for the ready event, but the user should be careful to handle
// any exceptions that are thrown.

// If you need access to the LDClient, then you can use ldProvider.getClient()

// Evaluations before the provider indicates it is ready may get default values with a
// CLIENT_NOT_READY reason.
OpenFeature.addHandler(ProviderEvents.Ready, (eventDetails) => {
    const client = OpenFeature.getClient();
    const value = await client.getBooleanValue('app-enabled', false, {targetingKey: 'my-key'});
});

// The LaunchDarkly provider supports the ProviderEvents.ConfigurationChanged event.
// The provider will emit this event for any flag key that may have changed (each event will contain
// a single key in the `flagsChanged` field).
OpenFeature.addHandler(ProviderEvents.Ready, (eventDetails) => {
    console.log(`Changed ${eventDetails.flagsChanged}`);
});

// When the LaunchDarkly provider is closed it will flush the events on the LDClient instance.
// This can be useful for short lived processes.
await OpenFeature.close();
```

Refer to the [SDK reference guide](https://docs.launchdarkly.com/sdk/server-side/node-js) for instructions on getting started with using the SDK.

## OpenFeature Specific Considerations

LaunchDarkly evaluates contexts, and it can either evaluate a single-context, or a multi-context. When using OpenFeature both single and multi-contexts must be encoded into a single `EvaluationContext`. This is accomplished by looking for an attribute named `kind` in the `EvaluationContext`.

There are 4 different scenarios related to the `kind`:
1. There is no `kind` attribute. In this case the provider will treat the context as a single context containing a "user" kind.
2. There is a `kind` attribute, and the value of that attribute is "multi". This will indicate to the provider that the context is a multi-context.
3. There is a `kind` attribute, and the value of that attribute is a string other than "multi". This will indicate to the provider a single context of the kind specified.
4. There is a `kind` attribute, and the attribute is not a string. In this case the value of the attribute will be discarded, and the context will be treated as a "user". An error message will be logged.

The `kind` attribute should be a string containing only contain ASCII letters, numbers, `.`, `_` or `-`.

The OpenFeature specification allows for an optional targeting key, but LaunchDarkly requires a key for evaluation. A targeting key must be specified for each context being evaluated. It may be specified using either `targetingKey`, as it is in the OpenFeature specification, or `key`, which is the typical LaunchDarkly identifier for the targeting key. If a `targetingKey` and a `key` are specified, then the `targetingKey` will take precedence.

There are several other attributes which have special functionality within a single or multi-context.
- A key of `privateAttributes`. Must be an array of string values. [Equivalent to '_meta.privateAttributes' in the SDK.](https://launchdarkly.github.io/node-server-sdk/interfaces/_launchdarkly_node_server_sdk_.LDContextMeta.html#privateAttributes)
- A key of `anonymous`. Must be a boolean value.  [Equivalent to 'anonymous' in the SDK.](https://launchdarkly.github.io/node-server-sdk/interfaces/_launchdarkly_node_server_sdk_.LDSingleKindContext.html#anonymous)
- A key of `name`. Must be a string. [Equivalent to 'name' in the SDK.](https://launchdarkly.github.io/node-server-sdk/interfaces/_launchdarkly_node_server_sdk_.LDSingleKindContext.html#name)

### Examples

#### A single user context

```typescript
const evaluationContext = {
    targetingKey: 'my-user-key'
};
```

#### A single context of kind "organization"

```typescript
const evaluationContext = {
    kind: 'organization',
    targetingKey: 'my-org-key'
};
```

#### A multi-context containing a "user" and an "organization"

```typescript

const evaluationContext = {
    kind: 'multi',
    organization: {
        targetingKey: 'my-org-key',
        myCustomAttribute: 'myAttributeValue'
    },
    user: {
        targetingKey: 'my-user-key'
    }
};
```

#### Setting private attributes in a single context

```typescript
const evaluationContext = {
    kind: 'organization',
    name: 'the-org-name',
    targetingKey: 'my-org-key',
    myCustomAttribute: 'myCustomValue',
    privateAttributes: ['myCustomAttribute']
};
```

#### Setting private attributes in a multi-context

```typescript
const evaluationContext = {
    kind: 'multi',
    organization: {
        targetingKey: 'my-org-key',
        name: 'the-org-name',
        // This will ONLY apply to the "organization" attributes.
        privateAttributes: ['myCustomAttribute'],
        // This attribute will be private.
        myCustomAttribute: 'myAttributeValue'
    },
    user: {
        targetingKey: 'my-user-key',
        anonymous: true,
        // This attribute will not be private.
        myCustomAttribute: 'myAttributeValue'
    }
};
```

## Learn more

Read our [documentation](http://docs.launchdarkly.com) for in-depth instructions on configuring and using LaunchDarkly. You can also head straight to the [complete reference guide for this SDK](https://docs.launchdarkly.com/sdk/server-side/node-js).

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

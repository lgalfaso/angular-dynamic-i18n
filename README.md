# Angular Dynamic I18n

***

## Usage

### Requirements

* **AngularJS v1.1.5+** is currently required.

### Quick start

0. Write the bundles and place them in an accessible location

1. Add the module to your dependencies

```javascript
angular.module('myApp', ['tmh.dynamicI18n', ...])
```

2. Configure where the bundles are located

```javascript
tmhDynamicI18nProvider.bundleLocationPattern('/somePath/{{bundle}}_{{locale}}.html');
```

3. If your application needs only one bundle, then set it as the default

```javascript
tmhDynamicI18n.defaultBundle('bundleName');
```

4. Use the directives `tmh-dynamic-i18n-content` and `data-tmh-i18n-attr` to i18n your application. E.g.

```html
<span tmh-dynamic-i18n-content="{key: 'foo'}" tmh-dynamic-i18n-attr="{bar: {key: 'baz'}}"></span>
```

This will replace the content of the tag with the template from the default bundle and locale for the key `'foo'`.
It will also set the attribute `bar` with the text of the template under the key `'baz'`




## Full description of the services and directives


### The `tmhI18nTemplate` directive

The `tmhI18nTemplate` is used to define new phrases. E.g.

```html
<tmh-i18n-template locale="en" bundle="test" key="hw">Hello {{name}}</tmh-i18n-template>
```

The attribute `key` is mandatory and is the key for this phrase. The attributes `locale` and `bundle` are optional,
if these are not defined, then the default values are used.


### The `tmhI18nContent` directive

The `tmhI18nContent` directive replaces the content of the element with the rendered phrase. The value of this attribute
must be an object, the following properties are recognized:

* `key` The key to the phrase, this property is mandatory
* `locale` The locale to the phase, this property is optional. When this value is not present, the default locale is assumed
* `bundle` The bundle to the phrase, this property is optional. When ths value is not present, the default bundle is assumed
* `locals` The local that will be present while rendering the template

E.g.
```html
<div data-tmh-i18n-content="{bundle: 'test', key: 'hw' locals:{name: 'Lucas'}}"></div>
```

### The `tmhI18nAttr` directive

The `tmhI18nAttr` works just like the `tmhI18nContent` directive, but it is used to set i18n values to attributes. The value
of the `tmhI18nAttr` attribute must be an object. For each property within this object, the same rules of `tmhI18nContent` apply
to set the value of a i18n attribute

E.g.
```html
<div data-tmh-i18n-attr="{tooltip: {bundle: 'test', key: 'hw' locals:{name: 'Lucas'}}}"></div>
```

This will set the value of the attribute `tooltip` the text of the template named `hw` using the locals `{name: 'Lucas'}`



### tmhDynamicI18nProvider

#### ::bundleLocationPattern

To keep the phrases in a separated file, it is possible to keep all the phrases for a given bundle and locale in a
separated location. When a phrase that needs of a particular bundle is needed, then the bundle will be loaded and cached.
The method `bundleLocationPattern` is used to specify the location where a particular bundle can be found. E.g.

```javascript
tmhDynamicI18nProvider.bundleLocationPattern('/base/bundles/{{bundle}}_{{locale}}.html');
```

The input of this method is the pattern to locate the bundles. The locals `bundle` and `locale` are recognized and represent
the bundle name and the specific locale.


### tmhDynamicI18n

#### ::locale

Method that works as getter/setter for the default locale. When used as a getter it returns the current default locale
or the empty string if there is no default locale. The default locale is set to `'en'`. E.g.

```javascript
tmhDynamicI18n.locale(); // Get the default locale
tmhDynamicI18n.locale('it'); // Set the default locale to 'it'
```

Changing the locale will force every `tmhI18nAttr` and `tmhI18nContent` that does not have a hard-coded locale, to be refreshed.


#### ::defaultBundle

Method that works as getter/setter for the default bundle. When used as a getter it returns the current default bundle
or the empty string if there is no default bundle. The default bundle is set to `''` (no bundle). E.g.

```javascript
tmhDynamicI18n.defaultBundle(); // Get the default bundle
tmhDynamicI18n.defaultBundle('test'); // Set the default bundle to 'it'
```

Changing the default bundle will not cause `tmhI18nAttr` nor `tmhI18nContent` to be refreshed. If this is needed, call `refreshAll()`


#### ::setTemplate (For advance users only)

Method to add a new template programmatically. E.g.
```javascript
tmhDynamicI18n.setTemplate({locale: 'en', bundle: 'test', key: 'hw', template: 'Hello World'})
```

#### ::refreshAll
Forces every `tmhI18nAttr` and `tmhI18nContent` to re-render their values. Use this method with care.



## Development

### Requirements

0. Install [Node.js](http://nodejs.org/) and NPM (should come with)

1. Install global dependencies `grunt-cli` and `bower`:

    ```bash
    $ npm install -g grunt-cli bower
    ```

2. Install local dependencies:

    ```bash
    $ npm install
    $ bower install
    ```

### Running the tests

```bash
$ grunt karma:unit
```
to run the test once

or

```bash
$ grunt karma:autotest
```
to run the tests continuously


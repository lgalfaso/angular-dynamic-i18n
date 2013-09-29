'use strict';

describe('dynamicI18n', function() {
  beforeEach(module('tmh.dynamicI18n'));

  describe('tmhDynamicI18n', function() {
    beforeEach(inject(function ($rootScope, tmhDynamicI18n) {
      tmhDynamicI18n.locale('en');
      tmhDynamicI18n.defaultBundle('');
      $rootScope.$apply();
    }));
    it('should return the list of locales in the right priority', inject(function(tmhDynamicI18n) {
      expect(tmhDynamicI18n.localePrecedence()).toEqual(['common']);
      expect(tmhDynamicI18n.localePrecedence('')).toEqual(['common']);
      expect(tmhDynamicI18n.localePrecedence('en')).toEqual(['en', 'common']);
      expect(tmhDynamicI18n.localePrecedence('en-us')).toEqual(['en-us', 'en', 'common']);
      expect(tmhDynamicI18n.localePrecedence('en_US')).toEqual(['en_US', 'en', 'common']);
    }));
    it('should be possible to get and set the locale', inject(function(tmhDynamicI18n) {
      expect(tmhDynamicI18n.locale()).toBe('en');
      expect(tmhDynamicI18n.locale('it')).toBe(tmhDynamicI18n);
      expect(tmhDynamicI18n.locale()).toBe('it');
    }));
    it('should trigger an event when changing the locale', inject(function($rootScope, tmhDynamicI18n) {
      var callback = jasmine.createSpy();

      $rootScope.$on('tmh.i18n.localeChangeSuccess', callback);
      $rootScope.$apply(function() {
        tmhDynamicI18n.locale('es');
        expect(callback.calls.length).toBe(0);
      });
      expect(callback.calls.length).toBe(1);
      expect(callback.calls[0].args[1]).toEqual('es');
    }));
    it('should not trigger an event when calling ::locale(locale) and there is no locale change', inject(function($rootScope, tmhDynamicI18n) {
      var callback = jasmine.createSpy();

      $rootScope.$on('tmh.i18n.localeChangeSuccess', callback);
      $rootScope.$apply(function() {
        tmhDynamicI18n.locale('en');
        expect(callback.calls.length).toBe(0);
      });
      expect(callback.calls.length).toBe(0);
    }));
    it('should be possible to get and set the default bundle', inject(function(tmhDynamicI18n) {
      expect(tmhDynamicI18n.defaultBundle()).toBe('');
      expect(tmhDynamicI18n.defaultBundle('test')).toBe(tmhDynamicI18n);
      expect(tmhDynamicI18n.defaultBundle()).toBe('test');
      expect(tmhDynamicI18n.defaultBundle('other')).toBe(tmhDynamicI18n);
      expect(tmhDynamicI18n.defaultBundle()).toBe('other');
      expect(tmhDynamicI18n.defaultBundle('')).toBe(tmhDynamicI18n);
      expect(tmhDynamicI18n.defaultBundle()).toBe('');
    }));
    it('should be possible to add a template without compile', inject(function(tmhDynamicI18n, tmhDynamicI18nCache) {
      tmhDynamicI18n.setTemplate({locale: 'en', bundle: 'test', key: 'hw', template: 'Hello World'});
      expect(tmhDynamicI18nCache.get("en", "test", "hw")).not.toBe(undefined);
    }));
    it('should throw when only when the key parameter is undefined', inject(function(tmhDynamicI18n) {
      expect(function() {tmhDynamicI18n.setTemplate({key: 'hw'});}).not.toThrow();
      expect(function() {tmhDynamicI18n.setTemplate({locale: 'en', bundle: 'test', template: 'Hello World'});}).toThrow();
    }));
  });

  describe('tmhDynamicI18nCache', function() {
    beforeEach(inject(function ($rootScope, tmhDynamicI18n) {
      tmhDynamicI18n.locale('en');
      tmhDynamicI18n.defaultBundle('');
      $rootScope.$apply();
    }));
    it('should be possible to cache based on the bundle and locale', inject(function(tmhDynamicI18nCache) {
      expect(tmhDynamicI18nCache.get('locale', 'bundle', 'key')).toBe(undefined);
      tmhDynamicI18nCache.put('locale', 'bundle', 'key', 'value');
      expect(tmhDynamicI18nCache.get('locale', 'bundle', 'key')).toBe('value');
      expect(tmhDynamicI18nCache.get('locale-1', 'bundle', 'key')).toBe(undefined);
      expect(tmhDynamicI18nCache.get('locale', 'bundle-1', 'key')).toBe(undefined);
      expect(tmhDynamicI18nCache.get('locale', 'bundle', 'key-1')).toBe(undefined);
      tmhDynamicI18nCache.remove('locale', 'bundle', 'key');
      expect(tmhDynamicI18nCache.get('locale', 'bundle', 'key')).toBe(undefined);
    }));
    it('should accept undefined as locale, bundle or key, and do nothing', inject(function(tmhDynamicI18nCache) {
      tmhDynamicI18nCache.put(undefined, 'bundle', 'key', 'value');
      expect(tmhDynamicI18nCache.get(undefined, 'bundle', 'key')).toBe(undefined);
      tmhDynamicI18nCache.put('locale', undefined, 'key', 'value');
      expect(tmhDynamicI18nCache.get('locale', undefined, 'key')).toBe(undefined);
      tmhDynamicI18nCache.put('locale', 'bundle', undefined, 'value');
      expect(tmhDynamicI18nCache.get('locale', 'bundle', undefined)).toBe(undefined);
    }));
    it('should accept the empty string as locale, bundle or key, and do nothing', inject(function(tmhDynamicI18nCache) {
      tmhDynamicI18nCache.put('', 'bundle', 'key', 'value');
      expect(tmhDynamicI18nCache.get('', 'bundle', 'key')).toBe(undefined);
      tmhDynamicI18nCache.put('locale', '', 'key', 'value');
      expect(tmhDynamicI18nCache.get('locale', '', 'key')).toBe(undefined);
      tmhDynamicI18nCache.put('locale', 'bundle', '', 'value');
      expect(tmhDynamicI18nCache.get('locale', 'bundle', '')).toBe(undefined);
    }));
  });

  describe('tmhDynamicI18nTemplate', function() {
    beforeEach(inject(function ($rootScope, tmhDynamicI18n) {
      tmhDynamicI18n.locale('en');
      tmhDynamicI18n.defaultBundle('');
      $rootScope.$apply();
    }));
    it('should put the transclude function into the template cache', inject(function($compile, tmhDynamicI18nCache) {
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello World</tmh-i18n-template></div>');
      expect(tmhDynamicI18nCache.get("en", "test", "hw")).not.toBe(undefined);
    }));
    it('should put the transclude function into the cache using the default locale if one is not specified', inject(function($compile, tmhDynamicI18n, tmhDynamicI18nCache) {
      tmhDynamicI18n.locale('it');
      $compile('<div><tmh-i18n-template bundle="test" key="hw">Hello World</tmh-i18n-template></div>');
      expect(tmhDynamicI18nCache.get("en", "test", "hw")).toBe(undefined);
      expect(tmhDynamicI18nCache.get("it", "test", "hw")).not.toBe(undefined);
    }));
    it('should put the transclude function into the cache using the specified locale if one is specified even if there is a default locale', inject(function($compile, tmhDynamicI18n, tmhDynamicI18nCache) {
      tmhDynamicI18n.locale('it');
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello World</tmh-i18n-template></div>');
      expect(tmhDynamicI18nCache.get("en", "test", "hw")).not.toBe(undefined);
      expect(tmhDynamicI18nCache.get("it", "test", "hw")).toBe(undefined);
    }));
    it('should put the transclude function into the cache using the default bundle if one is not specified', inject(function($compile, tmhDynamicI18n, tmhDynamicI18nCache) {
      tmhDynamicI18n.defaultBundle('foo');
      $compile('<div><tmh-i18n-template locale="en" key="hw">Hello World</tmh-i18n-template></div>');
      expect(tmhDynamicI18nCache.get("en", "", "hw")).toBe(undefined);
      expect(tmhDynamicI18nCache.get("en", "foo", "hw")).not.toBe(undefined);
    }));
    it('should put the transclude function into the cache using the specified bundle if one is specified even if there is a default bundle', inject(function($compile, tmhDynamicI18n, tmhDynamicI18nCache) {
      tmhDynamicI18n.defaultBundle('foo');
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello World</tmh-i18n-template></div>');
      expect(tmhDynamicI18nCache.get("en", "test", "hw")).not.toBe(undefined);
      expect(tmhDynamicI18nCache.get("en", "foo", "hw")).toBe(undefined);
    }));
  });

  describe('tmhDynamicI18nContent', function() {
    beforeEach(inject(function ($rootScope, tmhDynamicI18n) {
      tmhDynamicI18n.locale('en');
      tmhDynamicI18n.defaultBundle('');
      $rootScope.$apply();
    }));
    it('should render the template into the element', inject(function($rootScope, $compile) {
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello World</tmh-i18n-template></div>');
      var element = $compile('<div data-tmh-i18n-content="{locale: \'en\', bundle: \'test\', key: \'hw\'}"></div>')($rootScope);
      $rootScope.$apply();
      expect(element.text()).toBe('Hello World');
    }));
    it('should empty the element content when there is no template match', inject(function($rootScope, $compile) {
      var element = $compile('<div data-tmh-i18n-content="{locale: \'en\', bundle: \'test\', key: \'hw\'}">EMPTY</div>')($rootScope);
      $rootScope.$apply();
      expect(element.text()).toBe('');
    }));
    it('should fallback when a template with the specific locale is not present', inject(function($rootScope, $compile) {
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello World</tmh-i18n-template></div>');
      var element = $compile('<div data-tmh-i18n-content="{locale: \'en-us\', bundle: \'test\', key: \'hw\'}"></div>')($rootScope);
      $rootScope.$apply();
      expect(element.text()).toBe('Hello World');
    }));
    it('should be possible to fallback to `common`', inject(function($rootScope, $compile) {
      $compile('<div><tmh-i18n-template locale="common" bundle="test" key="hw">Hello World</tmh-i18n-template></div>');
      var element = $compile('<div data-tmh-i18n-content="{locale: \'en-us\', bundle: \'test\', key: \'hw\'}"></div>')($rootScope);
      $rootScope.$apply();
      expect(element.text()).toBe('Hello World');
    }));
    it('should pick the locale that is the best match', inject(function($rootScope, $compile) {
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello World</tmh-i18n-template></div>');
      $compile('<div><tmh-i18n-template locale="common" bundle="test" key="hw">Not good</tmh-i18n-template></div>');
      var element = $compile('<div data-tmh-i18n-content="{locale: \'en-us\', bundle: \'test\', key: \'hw\'}"></div>')($rootScope);
      $rootScope.$apply();
      expect(element.text()).toBe('Hello World');
    }));
    it('should have an isolated scope', inject(function($rootScope, $compile) {
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello {{name}}</tmh-i18n-template></div>');
      $rootScope.name = 'Lucas';
      var element = $compile('<div data-tmh-i18n-content="{locale: \'en\', bundle: \'test\', key: \'hw\'}"></div>')($rootScope);
      $rootScope.$apply();
      expect(element.text()).toBe('Hello ');
    }));
    it('should support locals', inject(function($rootScope, $compile) {
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello {{name}}</tmh-i18n-template></div>');
      var element = $compile('<div data-tmh-i18n-content="{locale: \'en\', bundle: \'test\', key: \'hw\', locals:{name: \'Lucas\'}}"></div>')($rootScope);
      $rootScope.$apply();
      expect(element.text()).toBe('Hello Lucas');
    }));
    it('should use the default locale when one is not specified', inject(function($rootScope, $compile, tmhDynamicI18n) {
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello World</tmh-i18n-template></div>');
      $compile('<div><tmh-i18n-template locale="es" bundle="test" key="hw">Hola Mundo</tmh-i18n-template></div>');
      tmhDynamicI18n.locale('es');
      var element = $compile('<div data-tmh-i18n-content="{bundle: \'test\', key: \'hw\'}"></div>')($rootScope);
      $rootScope.$apply();
      expect(element.text()).toBe('Hola Mundo');
    }));
    it('should use the default bundle when one is not specified', inject(function($rootScope, $compile, tmhDynamicI18n) {
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello World</tmh-i18n-template></div>');
      $compile('<div><tmh-i18n-template locale="en" bundle="foo" key="hw">Hello Foo</tmh-i18n-template></div>');
      tmhDynamicI18n.defaultBundle('test');
      var element = $compile('<div data-tmh-i18n-content="{locale: \'en\', key: \'hw\'}"></div>')($rootScope);
      $rootScope.$apply();
      expect(element.text()).toBe('Hello World');
    }));
    it('should change the content when the locale changes', inject(function($rootScope, $compile, tmhDynamicI18n) {
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello World</tmh-i18n-template></div>');
      $compile('<div><tmh-i18n-template locale="es" bundle="test" key="hw">Hola Mundo</tmh-i18n-template></div>');
      tmhDynamicI18n.locale('en');
      var element = $compile('<div data-tmh-i18n-content="{bundle: \'test\', key: \'hw\'}"></div>')($rootScope);
      $rootScope.$apply();
      tmhDynamicI18n.locale('es');
      $rootScope.$apply();
      expect(element.text()).toBe('Hola Mundo');
    }));
    it('should use a new scope when changing the locale', inject(function($rootScope, $compile, tmhDynamicI18n) {
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw"><span data-ng-init="alien=\'Alien\'">Hello World</span></tmh-i18n-template></div>');
      $compile('<div><tmh-i18n-template locale="es" bundle="test" key="hw">Hola Mundo{{alien}}</tmh-i18n-template></div>');
      tmhDynamicI18n.locale('en');
      var element = $compile('<div data-tmh-i18n-content="{bundle: \'test\', key: \'hw\'}"></div>')($rootScope);
      $rootScope.$apply();
      tmhDynamicI18n.locale('es');
      $rootScope.$apply();
      expect(element.text()).toBe('Hola Mundo');
    }));
    it('should be possible to change the template and force the new template', inject(function($rootScope, $compile, tmhDynamicI18n) {
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello World</tmh-i18n-template></div>');
      var element = $compile('<div data-tmh-i18n-content="{bundle: \'test\', key: \'hw\'}"></div>')($rootScope);
      $rootScope.$apply();
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello Wonderful World!</tmh-i18n-template></div>');
      $rootScope.$apply();
      tmhDynamicI18n.refreshAll();
      expect(element.text()).toBe('Hello World');
      $rootScope.$apply();
      expect(element.text()).toBe('Hello Wonderful World!');
    }));
  });

  describe('tmhDynamicI18nAttr', function() {
    beforeEach(inject(function ($rootScope, tmhDynamicI18n) {
      tmhDynamicI18n.locale('en');
      tmhDynamicI18n.defaultBundle('');
      $rootScope.$apply();
    }));
    it('should render the template text into the attribute', inject(function($rootScope, $compile) {
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello World</tmh-i18n-template></div>');
      var element = $compile('<div data-tmh-i18n-attr="{foo: {locale: \'en\', bundle: \'test\', key: \'hw\'}}">Do not modify</div>')($rootScope);
      $rootScope.$apply();
      expect(element.text()).toBe('Do not modify');
      expect(element.attr('foo')).toBe('Hello World');
    }));
    it('should have an isolated scope', inject(function($rootScope, $compile) {
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello {{name}}</tmh-i18n-template></div>');
      $rootScope.name = 'Lucas';
      var element = $compile('<div data-tmh-i18n-attr="{foo: {locale: \'en\', bundle: \'test\', key: \'hw\'}}"></div>')($rootScope);
      $rootScope.$apply();
      expect(element.attr('foo')).toBe('Hello ');
    }));
    it('should support locals', inject(function($rootScope, $compile) {
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello {{name}}</tmh-i18n-template></div>');
      var element = $compile('<div data-tmh-i18n-attr="{foo: {locale: \'en\', bundle: \'test\', key: \'hw\', locals:{name: \'Lucas\'}}}"></div>')($rootScope);
      $rootScope.$apply();
      expect(element.attr('foo')).toBe('Hello Lucas');
    }));
    it('should change the content when the locale changes', inject(function($rootScope, $compile, tmhDynamicI18n) {
      $compile('<div><tmh-i18n-template locale="en" bundle="test" key="hw">Hello World</tmh-i18n-template></div>');
      $compile('<div><tmh-i18n-template locale="es" bundle="test" key="hw">Hola Mundo</tmh-i18n-template></div>');
      tmhDynamicI18n.locale('en');
      var element = $compile('<div data-tmh-i18n-attr="{foo: {bundle: \'test\', key: \'hw\'}}"></div>')($rootScope);
      $rootScope.$apply();
      tmhDynamicI18n.locale('es');
      $rootScope.$apply();
      expect(element.attr('foo')).toBe('Hola Mundo');
    }));
  });

  describe('loading a bundle from an external source', function() {
    beforeEach(module(function(tmhDynamicI18nProvider) {
      tmhDynamicI18nProvider.bundleLocationPattern('/base/bundles/{{bundle}}_{{locale}}.html');
    }));
    beforeEach(inject(function ($rootScope, $httpBackend, tmhDynamicI18n) {
      tmhDynamicI18n.locale('en-us');
      tmhDynamicI18n.defaultBundle('test');
      $rootScope.$apply();
      $httpBackend.whenGET('/base/bundles/test_en-us.html').respond('');
      $httpBackend.whenGET('/base/bundles/test_en.html').respond('<tmh-i18n-template key="hw">Hello World</tmh-i18n-template>');
      $httpBackend.whenGET('/base/bundles/test_common.html').respond('');
    }));
    it('should render the template into the element', inject(function($rootScope, $compile, $httpBackend) {
      var element = $compile('<div data-tmh-i18n-content="{key: \'hw\'}"></div>')($rootScope);
      $rootScope.$apply();
      $httpBackend.flush();
      expect(element.text()).toBe('Hello World');
    }));
  })
});

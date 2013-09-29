(function () {
  'use strict';

  var module = angular.module('tmh.dynamicI18n', []);

  module.provider('tmhDynamicI18n', function() {
    var currentLocale = 'en',
      currentBundle = undefined,
      refreshAsked = false,
      bundleLocationPattern = undefined;
    this.$get = ['$rootScope', '$compile', '$interpolate', '$http', '$q', 'tmhDynamicI18nCache', function($rootScope, $compile, $interpolate, $http, $q, tmhDynamicI18nCache) {
      var bundleLocation = bundleLocationPattern && $interpolate(bundleLocationPattern);
      return {
        setTemplate: function (info) {
          if (info.key === undefined) {
            throw new Error('Key is undefined');
          }
          var element = angular.element('<span data-tmh-i18n-template>' + (info.template || '') + '</span>');
          element.attr('bundle', info.bundle);
          element.attr('locale', info.locale);
          element.attr('key', info.key);
          $compile(element);
        },
        refreshAll: function() {
          if(!refreshAsked) {
            refreshAsked = true;
            $rootScope.$evalAsync(function() {
              $rootScope.$broadcast('tmh.i18n.refresh');
              refreshAsked = false;
            });
          }
        },
        localePrecedence: function (locale) {
          var result = ['common'], pos = 0, idx;
          locale = locale || '';
          while ((idx = locale.substr(pos).search(/[-_]/)) > 0) {
            pos += idx;
            result.unshift(locale.substr(0, pos));
          }
          if (locale) {
            result.unshift(locale);
          } 
          return result;
        },
        locale: function(value) {
          var result;
          if (value) {
            if (currentLocale !== value) {
              $rootScope.$evalAsync(function() {
                $rootScope.$broadcast('tmh.i18n.localeChangeSuccess', value);
              });
            }
            currentLocale = value;
            result = this;
          } else {
            result = currentLocale;
          }
          return result;
        },
        defaultBundle: function(value) {
          var result;
          if (value === undefined) {
            result = currentBundle;
          } else {
            currentBundle = value;
            result = this;
          }
          return result;
        },
        getTransclude: function(locale, bundle, key) {
          var locales = this.localePrecedence(locale || this.locale()),
            i,
            result;

          function loadBundles() {
            var result = [];

            if (!bundleLocation) {
              return [];
            }
            angular.forEach(locales, function(localeToLoad) {
              var promise = tmhDynamicI18nCache.get(localeToLoad, bundle, '$tmh.locale.$q');
              if (!promise) {
                promise = $http.get(bundleLocation({bundle: bundle, locale: localeToLoad}));
                promise.then(function(response) {
                  var previousLocale = currentLocale,
                    previousBundle = currentBundle;
                  currentLocale = localeToLoad;
                  currentBundle = bundle;
                  try {
                    if (response.data) {
                      $compile(response.data);
                    }
                  } finally {
                    currentLocale = previousLocale;
                    currentBundle = previousBundle;
                  }
                });
              }
              result.push(promise);
            });

            return result;
          }

          bundle = bundle || this.defaultBundle();

          return $q.all(loadBundles()).then(function() {
            for (i = 0; !result && i < locales.length; ++i) {
              result = tmhDynamicI18nCache.get(locales[i], bundle, key);
            }
            return result;
          });
        }
      };
    }];
    this.bundleLocationPattern = function(value) {
      if (value) {
        bundleLocationPattern = value;
        return this;
      } else {
        return bundleLocationPattern;
      }
    };
  });

  module.provider('tmhDynamicI18nCache', function() {
    this.$get = ['$cacheFactory', function($cacheFactory) {
      var mainCache = $cacheFactory('tmh.dynamicLocales');
      function getCache(locale, bundle) {
        var localeCache, bundleCache;
        localeCache = mainCache.get(locale);
        if (locale && !localeCache) {
          localeCache = $cacheFactory('tmh.dynamicLocales - ' + locale);
          mainCache.put(locale, localeCache);
        }
        bundleCache = localeCache && localeCache.get(bundle);
        if (localeCache && bundle && !bundleCache) {
          bundleCache = $cacheFactory('tmh.dynamicLocales - ' + locale + ' - ' + bundle);
          localeCache.put(bundle, bundleCache);
        }
        return bundleCache;
      }
      return {
        get: function(locale, bundle, key) {
          return (key && getCache(locale, bundle) || {get: angular.noop}).get(key);
        },
        put: function(locale, bundle, key, value) {
          return (key && getCache(locale, bundle) || {put: angular.noop}).put(key, value);
        },
        remove: function(locale, bundle, key) {
          return (key && getCache(locale, bundle) || {remove: angular.noop}).remove(key);
        }
      };
    }];
  });

  module.directive('tmhI18nTemplate', ['tmhDynamicI18n', 'tmhDynamicI18nCache', function(tmhDynamicI18n, tmhDynamicI18nCache) {
    return {
      compile: function(element, attrs, transclude) {
        tmhDynamicI18nCache.put(attrs.locale || tmhDynamicI18n.locale(), attrs.bundle || tmhDynamicI18n.defaultBundle(), attrs.key, transclude);
        return angular.noop;
      },
      restrict: 'AE',
      transclude: true
    };
  }]);

  module.directive('tmhI18nContent', ['$animate', 'tmhDynamicI18nCache', 'tmhDynamicI18n', function($animate, tmhDynamicI18nCache, tmhDynamicI18n) {
    return {
      link: function($scope, element, attrs) {
        var info = $scope.$eval(attrs.tmhI18nContent),
          scope;

        function setContent() {
          tmhDynamicI18n.getTransclude(info.locale, info.bundle, info.key).then(function(fn) {
            element.html('');
            if (scope) {
              scope.$destroy();
              scope = undefined;
            }
            if (fn) {
              scope = $scope.$new(true);
              angular.forEach(info.locals, function(value, key) {
                scope[key] = value;
              });
              fn(scope, function(clone) {
                $animate.enter(clone, element);
              });
            }
          });
        }

        setContent();
        if (!info.locale) {
          $scope.$on('tmh.i18n.localeChangeSuccess', function() {
            setContent();
          });
        }
        $scope.$on('tmh.i18n.refresh', function() {
          setContent();
        })
      }
    };
  }]);

  // One day there will be an extensible compiler at angular.js, until that day comes, this is
  // the only reasonable option available.
  module.directive('tmhI18nAttr', ['tmhDynamicI18nCache', 'tmhDynamicI18n', function(tmhDynamicI18nCache, tmhDynamicI18n) {
    return {
      link: function($scope, element, attrs) {
        var info = $scope.$eval(attrs.tmhI18nAttr),
          scopes = [];
        function setContent() {
          angular.forEach(scopes, function(scope) {
            scope.$destroy();
          });
          scopes.length = 0;
          angular.forEach(info, function(value, key) {
            var result = angular.element('<div></div>'),
              scope;

            tmhDynamicI18n.getTransclude(value.locale, value.bundle, value.key).then(function(fn) {
              if (fn) {
                scope = $scope.$new(true);
                scopes.push(scope);
                angular.forEach(value.locals, function(v, key) {
                  scope[key] = v;
                });
                fn(scope, function(clone) {
                  result.append(clone);
                });
                scope.$watch(
                  function() { return result.text(); },
                  function(text) { attrs.$set(key, text);}
                );
              } else {
                attrs.$set(key, '');
              }
            });
          });
        }

        setContent();
        $scope.$on('tmh.i18n.localeChangeSuccess', function() {
          setContent();
        });
        $scope.$on('tmh.i18n.refresh', function() {
          setContent();
        });
      }
    };
  }]);
}());

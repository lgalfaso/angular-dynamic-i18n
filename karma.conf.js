
autoWatch = false;
singleRun = true;
logLevel = LOG_INFO;
logColors = true;
browsers = ['Chrome']
runnerPort = 0;
files = [
  JASMINE,
  JASMINE_ADAPTER,
  'components/angular/angular.js',
  'components/angular-mocks/angular-mocks.js',
  'src/*.js',
  'test/*Spec.js'
];
junitReporter = {
  outputFile: 'test_out/unit.xml',
  suite: 'unit'
};

#! /usr/bin/env node

/* eslint-disable */
const { Command } = require('commander');
const program = new Command();

var path = require('path');
var shell = require('shelljs');
var fs = require('fs');
var examples = {};
var basePath = path.resolve('');
var webpackConfigPath = path.join(
  __dirname,
  './webpack-all-examples-AUTOGENERATED.config.js'
);

var buildConfig = require('./template-multiexample-config.js');
const buildExampleIndex = require('./build-example-index.js');
const buildExampleMarkdown = require('./build-example-index-markdown.js');
const rootPath = path.resolve(path.join(__dirname, '../..'));
var distDir = path.join(rootPath, '/.static-examples');
var docsDir = path.join(rootPath, '/packages/docs/docs/');

if (!fs.existsSync(distDir)) {
  console.log('Creating directory: ' + distDir);
  fs.mkdirSync(distDir);
}

program
  .option(
    '--build',
    'Build and write examples to disk, rather than using the Webpack Dev Server'
  )
  .option(
    '--fromRoot',
    'A flag to set that this is being run from the root of the repo'
  )
  .parse(process.argv);

const options = program.opts();

function getSplitedPath(filePath) {
  return filePath.split(/[/\\]/);
}

function validPath(str) {
  return str.replace(/\\\\/g, '/');
}

// ----------------------------------------------------------------------------
// Find examples
// ----------------------------------------------------------------------------
if (options.fromRoot === true) {
  configuration = {
    examples: [
      { path: 'packages/core/examples', regexp: 'index.ts' },
      { path: 'packages/tools/examples', regexp: 'index.ts' },
      {
        path: 'packages/streaming-image-volume-loader/examples',
        regexp: 'index.ts',
      },
      {
        path: 'packages/dicomImageLoader/examples',
        regexp: 'index.ts',
      },
    ],
  };
} else {
  configuration = {
    examples: [{ path: '../examples', regexp: 'index.ts' }],
  };
}

if (configuration.examples) {
  var filterExamples = [].concat(program.args).filter((i) => !!i);
  var exampleCount = 0;
  var currentExamples;

  const allExamplePaths = {};
  configuration.examples.forEach(function (entry) {
    const regexp = entry.regexp
      ? new RegExp(entry.regexp)
      : /example\/index.ts$/;
    let fullPath = path.join(basePath, entry.path ? entry.path : entry);

    // Single example use case
    examples[fullPath] = {};
    currentExamples = examples[fullPath];
    shell.cd(fullPath);
    shell
      .find('.')
      .filter(function (file) {
        return file.match(regexp);
      })
      .forEach(function (file) {
        var fullPath = getSplitedPath(file);
        var exampleName = fullPath.pop();

        while (['index.ts', 'example'].indexOf(exampleName) !== -1) {
          exampleName = fullPath.pop();
        }

        currentExamples[exampleName] = './' + file;
        console.log(' -', exampleName, ':', file);
        exampleCount++;

        allExamplePaths[exampleName] = validPath(path.resolve(file));
      });
  });

  if (exampleCount === 0) {
    console.error(
      `=> Error: Did not find any examples matching ${filterExamples[0]}`
    );
    process.exit(1);
    return;
  }

  // say name of running example
  const currentWD = process.cwd();

  shell.cd('../../kit');
  shell.exec(`yarn run build`);

  shell.cd(currentWD);

  // run the build for dicom image loader
  shell.cd('../../dicomImageLoader');
  shell.exec(`yarn run webpack:dynamic-import`);

  shell.cd(currentWD);

  const examplePaths = Object.values(allExamplePaths);
  const exampleNames = Object.keys(allExamplePaths);
  const conf = buildConfig(
    exampleNames,
    examplePaths,
    distDir,
    validPath(rootPath)
  );
  shell.ShellString(conf).to(webpackConfigPath);

  const exampleIndexHTML = buildExampleIndex(
    exampleNames,
    examplePaths,
    validPath(rootPath)
  );
  shell.ShellString(exampleIndexHTML).to(path.join(distDir, 'index.html'));

  const exampleIndexMarkdown = buildExampleMarkdown(
    exampleNames,
    examplePaths,
    validPath(rootPath)
  );
  shell.ShellString(exampleIndexMarkdown).to(path.join(docsDir, 'examples.md'));
  //shell.cd(rootPath);

  if (options.build == true) {
    shell.exec(`webpack --progress --config ${webpackConfigPath}`);
  } else {
    shell.exec(
      `webpack serve --progress --host 0.0.0.0 --config ${webpackConfigPath}`
    );
  }
}

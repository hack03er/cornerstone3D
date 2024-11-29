const path = require('path');

const csRenderBasePath = path.resolve('packages/core/src/index');
const csToolsBasePath = path.resolve('packages/tools/src/index');
const csAdapters = path.resolve('packages/adapters/src/index');
const csDICOMImageLoaderDistPath = path.resolve(
  'packages/dicomImageLoader/src/index'
);
const csNiftiPath = path.resolve('packages/nifti-volume-loader/src/index');

module.exports = function buildConfig(name, destPath, root, exampleBasePath) {
  return `
// THIS FILE IS AUTOGENERATED - DO NOT EDIT
var path = require('path')

var rules = require('./rules-examples.js');
var modules = [path.resolve('../node_modules/'), path.resolve('../../../node_modules/')];

const rspack = require('@rspack/core');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: '${root.replace(/\\/g, '/')}/utils/ExampleRunner/template.html',
    }),
    new rspack.DefinePlugin({
      __BASE_PATH__: "''",
    }),
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from:
          '../../../node_modules/dicom-microscopy-viewer/dist/dynamic-import/',
          to: '${destPath.replace(/\\/g, '/')}',
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  entry: path.join('${exampleBasePath.replace(/\\/g, '/')}'),
  output: {
    path: '${destPath.replace(/\\/g, '/')}',
    filename: '${name}.js',
  },
  module: {
    rules,
  },
  experiments: {
    asyncWebAssembly: true
  },
  externals: {
    "dicom-microscopy-viewer": {
      root: "window",
      commonjs: "dicomMicroscopyViewer",
    },
  },
  resolve: {
    alias: {
      '@cornerstonejs/core': '${csRenderBasePath.replace(/\\/g, '/')}',
      '@cornerstonejs/tools': '${csToolsBasePath.replace(/\\/g, '/')}',
      '@cornerstonejs/nifti-volume-loader': '${csNiftiPath.replace(
        /\\/g,
        '/'
      )}',
      '@cornerstonejs/adapters': '${csAdapters.replace(/\\/g, '/')}',
      '@cornerstonejs/dicom-image-loader': '${csDICOMImageLoaderDistPath.replace(
        /\\/g,
        '/'
      )}',
    },
    modules,
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      events: false
    },
  },
  devServer: {
    hot: true,
    open: false,
    port: ${process.env.CS3D_PORT || 3000},
    historyApiFallback: true,
    allowedHosts: [
      '127.0.0.1',
      'localhost',
    ],
  },
};
`;
};

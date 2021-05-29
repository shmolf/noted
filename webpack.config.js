// @ts-nocheck
var Encore = require('@symfony/webpack-encore');
var path = require('path');

// Manually configure the runtime environment if not already configured yet by the "encore" command.
// It's useful when you use tools that rely on webpack.config.js file.
if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore
    // directory where compiled assets will be stored
    .setOutputPath('public/build/')
    // public path used by the web server to access the output path
    .setPublicPath('/build')
    // only needed for CDN's or sub-directory deploy
    //.setManifestKeyPrefix('build/')

    .addAliases({
      JS: path.resolve(__dirname, './assets/js/'),
      CSS: path.resolve(__dirname, './assets/css/'),
      NODE: path.resolve(__dirname, './node_modules/'),
      Images: path.resolve(__dirname, './assets/images/')
    })

    .copyFiles({
      from: './assets/images',
      to: 'images/[path][name].[hash:8].[ext]',
      pattern: /\.(png|jpg|jpeg)$/
    })

    /*
     * ENTRY CONFIG
     *
     * Add 1 entry for each "page" of your app
     * (including one that's included on every page - e.g. "app")
     *
     * Each entry will result in one JavaScript file (e.g. app.js)
     * and one CSS file (e.g. app.css) if your JavaScript imports CSS.
     */
    .addEntry('app', './assets/js/app.js')
    .addEntry('welcome', './assets/js/welcome.js')
    .addEntry('notes', './assets/js/notes/main.js')
    .addEntry('user-admin', './assets/js/users/admin.js')
    .addEntry('user-create', './assets/js/users/create.js')
    .addEntry('user-login', './assets/js/users/login.js')
    .addEntry('user-edit', './assets/js/users/edit.js')
    .addEntry('forgot-request', './assets/js/password/forgot-request.js')

    // When enabled, Webpack "splits" your files into smaller pieces for greater optimization.
    .splitEntryChunks()
    .configureSplitChunks(function(splitChunks) {
        // change the configuration, so duplicate code is shared
        splitChunks.minSize = 0;
    })

    // will require an extra script tag for runtime.js
    // but, you probably want this, unless you're building a single-page app
    .enableSingleRuntimeChunk()

    /*
     * FEATURE CONFIG
     *
     * Enable & configure other features below. For a full
     * list of features, see:
     * https://symfony.com/doc/current/frontend.html#adding-more-features
     */
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(true)//!Encore.isProduction())
    // enables hashed filenames (e.g. app.abc123.css)
    .enableVersioning(true) // Encore.isProduction()

    // enables @babel/preset-env polyfills
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = 'usage';
        config.corejs = 3;
    })

    // enables Sass/SCSS support
    .enableSassLoader()

    // inline base64 URLs for the given limits, direct URLs for the rest
    .configureImageRule({
      type: 'asset',
      maxSize: 8192
    })
    .configureFontRule({
      type: 'asset',
      maxSize: 4096
    })

    .addLoader({ test: /\.md$/, loader: 'raw-loader' })

    // uncomment if you use TypeScript
    //.enableTypeScriptLoader()

    // uncomment to get integrity="..." attributes on your script & link tags
    // requires WebpackEncoreBundle 1.4 or higher
    //.enableIntegrityHashes(Encore.isProduction())

    // uncomment if you're having problems with a jQuery plugin
    //.autoProvidejQuery()

    .configureWatchOptions(function(watchOptions) {
      // enable polling and check for changes every 250ms
      // polling is useful when running Encore inside a Virtual Machine
      watchOptions.poll = 500;
    })
;

const config = Encore.getWebpackConfig();
// config.resolve.extensions.unshift('.mjs');
// The addition below, is so that some repos that use `.mjs` extensions, don't break.
config.module.rules.push({
  test: /\.(mjs|jsx)$/,
  resolve: {
    fullySpecified: false,
  }
});

config.module.rules.push({
  test: /\.worker\.js$/i,
  use: [
    {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-env"],
      },
    },
    {
      loader: "worker-loader",
      options: {
        // publicPath: './',
        filename: "[name].[contenthash].js",
      },
    },
  ],
});

// let's clean the output folder, before repopulating
config.output.clean= true;

module.exports = config;

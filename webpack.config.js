const Encore = require('@symfony/webpack-encore');
const ESLintPlugin = require('eslint-webpack-plugin');
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
      SCRIPTS: path.resolve(__dirname, './assets/scripts/'),
      STYLES: path.resolve(__dirname, './assets/styles/'),
      NODE: path.resolve(__dirname, './node_modules/'),
      IMAGES: path.resolve(__dirname, './assets/images/'),
    })

    .addEntries({
      'app': './assets/scripts/app.ts',
      'welcome': './assets/scripts/welcome.ts',
      'notes': './assets/scripts/notes/main.ts',
      'user-admin': './assets/scripts/users/admin.ts',
      'user-create': './assets/scripts/users/create.ts',
      'user-login': './assets/scripts/users/login.ts',
      'user-edit': './assets/scripts/users/edit.ts',
      'forgot-request': './assets/scripts/password/forgot-request.ts',
      'workspace-management': './assets/scripts/workspace/management.ts',
    })

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
    .enableSourceMaps(!Encore.isProduction())
    // enables hashed filenames (e.g. app.abc123.css)
    .enableVersioning(true)

    .configureBabel((config) => {
        config.plugins.push('@babel/plugin-proposal-class-properties');
    })

    // enables @babel/preset-env polyfills
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = 'usage';
        config.corejs = 3;
    })

    // enables Sass/SCSS support
    .enableSassLoader()

    // uncomment if you use TypeScript
    .enableTypeScriptLoader()

    // uncomment if you use React
    //.enableReactPreset()

    // uncomment to get integrity="..." attributes on your script & link tags
    // requires WebpackEncoreBundle 1.4 or higher
    //.enableIntegrityHashes(Encore.isProduction())

    .configureWatchOptions(function(watchOptions) {
      // enable polling and check for changes every 250ms
      // polling is useful when running Encore inside a Virtual Machine
      watchOptions.poll = 500;
    })

    // inline base64 URLs for the given limits, direct URLs for the rest
    .configureImageRule({
      type: 'asset',
      maxSize: 8192
    })
    .configureFontRule({
      type: 'asset',
      maxSize: 4096
    })
    .cleanupOutputBeforeBuild()

    .addLoader({ test: /\.md$/, loader: 'raw-loader' })
    .addPlugin(new ESLintPlugin({}))
;

const config = Encore.getWebpackConfig();

config.module.rules.push({
  test: /\.(mjs|jsx)$/,
  resolve: {
    fullySpecified: false,
  },
  // Below is recommended by https://github.com/grrr-amsterdam/cookie-consent/issues/13#issuecomment-821882783
  // use: {
  //   loader: 'babel-loader',
  //   options: {
  //     presets: ['@babel/preset-env'],
  //   },
  // },
});

config.module.rules.push(
  {
    test: /\.worker\.js$/,
    use: { loader: "worker-loader" },
  }
);

module.exports = config;

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const path = require("path");

const env = process.env.NODE_ENV || "development";
const isProd = env === "production";

module.exports = {
  // Set build mode and sets process.env.NODE_ENV
  mode: env,
  // Enable debugging while developing
  devtool: isProd ? false : "source-map",
  // Enable SPA routing
  devServer: {
    historyApiFallback: true,
  },
  // Use src/main.js entrypoint and output in build/bundle.js
  entry: { "build/bundle": ["./src/main.js"] },
  // Svelte configurations, see https://github.com/sveltejs/svelte-loader
  resolve: {
    alias: {
      svelte: path.resolve("node_modules", "svelte"),
    },
    extensions: [".mjs", ".js", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"],
  },
  output: {
    // Set "public" as the output folder
    path: path.resolve(__dirname, "public"),
    // Put js chunks in build/chunks
    chunkFilename: "build/chunks/[name].js",
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: "svelte-loader",
          options: {
            compilerOptions: {
              dev: !isProd,
            },
            emitCss: isProd,
            hotReload: !isProd,
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../", // required to reference assets on build folder
            },
          },
          "css-loader",
          "postcss-loader",
        ],
      },
      {
        // required to prevent errors from Svelte on Webpack 5+
        test: /node_modules\/svelte\/.*\.mjs$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.ttf$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "./build/assets/[contenthash].[ext]", // output .fft assets on build folder
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({}),
    new MonacoWebpackPlugin({
      // Output workers on build folder
      filename: "build/workers/[name].worker.js",
      // Enable specific features
      // features: [],
    }),
    new Dotenv({
      // Load system env variables if any. This is needed to deploy to
      // servers where env variables are not set with a .env file (Netlify)
      systemvars: true,
    }),
  ],
};

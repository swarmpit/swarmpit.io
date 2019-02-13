"use strict";
const { src, dest, series, parallel, watch } = require("gulp");
const less = require("gulp-less");
const server = require("browser-sync").create();
const concat = require("gulp-concat");
const cssnano = require("cssnano");
const autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss");
const htmlmin = require("gulp-htmlmin");
const rename = require("gulp-rename");
const size = require("gulp-size");
const uglify = require("gulp-uglify");
const path = require("path");

function styles() {
  const plugins = [
    autoprefixer({
      browsers: ["> 5%", "last 4 versions", "IE 8"],
      cascade: false
    }),
    cssnano({
      reduceIdents: false,
      zindex: false
    })
  ];
  return src("src/less/swarmpit.less")
    .pipe(less({ paths: [path.join(__dirname, "node_modules")] }))
    .pipe(postcss(plugins))
    .pipe(rename({ suffix: ".min" }))
    .pipe(size({ title: "CSS", gzip: true }))
    .pipe(dest("s3/swarmpit.io/css"));
}

function scripts() {
  return src([
    "node_modules/jquery.easing/jquery.easing.js",
    "node_modules/bootstrap/js/affix.js",
    "node_modules/bootstrap/js/tab.js",
    "node_modules/bootstrap/js/collapse.js",
    "src/js/swarmpit.js"
  ])
    .pipe(concat("swarmpit.js"))
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(size({ title: "JS", gzip: true }))
    .pipe(dest("s3/swarmpit.io/js"));
}

function html() {
  return src("s3/swarmpit.io/index.html")
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        decodeEntities: true,
        minifyCSS: true,
        minifyJS: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeOptionalTags: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true
      })
    )
    .pipe(size({ title: "HTML", gzip: true }))
    .pipe(dest("s3/swarmpit.io"));
}

function browserSync(done) {
  server.init({
    server: {
      baseDir: "s3/swarmpit.io"
    }
  });
  done();
}

function reload(done) {
  server.reload();
  done();
}

const watchStyles = () => watch("src/less/*.less", series(styles, reload));
const watchScripts = () => watch("src/js/*.js", series(scripts, reload));
const watchHtml = () => watch("s3/swarmpit.io/*.html", reload);
const watchAll = parallel(watchHtml, watchScripts, watchStyles);

exports.default = series(browserSync, parallel(styles, scripts), watchAll);
exports.prod = parallel(html, styles, scripts);

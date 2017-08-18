var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var cssnano = require("cssnano");
var autoprefixer = require("autoprefixer");
var postcss = require('gulp-postcss');
var htmlmin = require("gulp-htmlmin");
var rename = require("gulp-rename");
var size = require("gulp-size");
var uglify = require('gulp-uglify');
var path = require('path');

// Compile LESS files from /less into /css
gulp.task('less', function () {
    return gulp.src('src/less/swarmpit.less')
        .pipe(less({ paths: [path.join(__dirname, 'node_modules')] }))
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function () {
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
    return gulp.src('src/css/swarmpit.css')
        .pipe(postcss(plugins))
        .pipe(rename({ suffix: '.min' }))
        .pipe(size({ title: "CSS", gzip: true }))
        .pipe(gulp.dest('s3/swarmpit.io/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify JS
gulp.task('minify-js', function () {
    return gulp.src(['node_modules/bootstrap/js/affix.js', 'node_modules/bootstrap/js/collapse.js', 'src/js/swarmpit.js'])
        .pipe(concat('swarmpit.js'))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(size({ title: "JS", gzip: true }))
        .pipe(gulp.dest('s3/swarmpit.io/js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('minify-html', function () {
    return gulp.src('s3/swarmpit.io/index.html')
        .pipe(htmlmin({
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
        }))
        .pipe(size({ title: "HTML", gzip: true }))
        .pipe(gulp.dest('s3/swarmpit.io'))
});

// Run everything
gulp.task('prod', ['minify-html', 'minify-css', 'minify-js']);

// Configure the browserSync task
gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: 's3/swarmpit.io'
        }
    })
});

// Dev task with browserSync
gulp.task('watch', ['minify-css', 'minify-js'], function () {
    gulp.watch('src/less/*.less', ['less']);
    gulp.watch('src/css/*.css', ['minify-css']);
    gulp.watch('src/js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('s3/swarmpit.io/*.html', browserSync.reload);
    gulp.watch('s3/swarmpit.io/js/**/*.js', browserSync.reload);
});

gulp.task('default', ['watch', 'browserSync']);

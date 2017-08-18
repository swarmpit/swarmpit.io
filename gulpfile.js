var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var cleanCSS = require('gulp-clean-css');
var htmlmin = require("gulp-htmlmin");
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');

// Compile LESS files from /less into /css
gulp.task('less', function () {
    return gulp.src('src/less/swarmpit.less')
        .pipe(less())
        .pipe(gulp.dest('s3/swarmpit.io/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function () {
    return gulp.src('s3/swarmpit.io/css/swarmpit.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('s3/swarmpit.io/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify JS
gulp.task('minify-js', function () {
    return gulp.src('src/js/swarmpit.js')
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
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
       .pipe(gulp.dest('s3/swarmpit.io'))
});

// Copy lib libraries from /node_modules into /lib
gulp.task('copy', function () {
    gulp.src(['node_modules/simple-line-icons/*/*'])
        .pipe(gulp.dest('s3/swarmpit.io/lib/simple-line-icons'));
});

// Run everything
gulp.task('prod', ['minify-html', 'minify-css', 'minify-js', 'copy']);

// Configure the browserSync task
gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: 's3/swarmpit.io'
        }
    })
});

// Dev task with browserSync
gulp.task('default', ['browserSync', 'less', 'minify-css', 'minify-js'], function () {
    gulp.watch('src/less/*.less', ['less']);
    gulp.watch('s3/swarmpit.io/css/*.css', ['minify-css']);
    gulp.watch('src/js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('s3/swarmpit.io/*.html', browserSync.reload);
    gulp.watch('s3/swarmpit.io/js/**/*.js', browserSync.reload);
});

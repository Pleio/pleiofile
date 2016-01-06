var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var assign = require('lodash.assign');

var customOpts = {
    entries: ['static/js/src/pleiofile.jsx'],
    extensions: ['.jsx']
};

gulp.task('watch', watch);
function watch() {
    customOpts['debug'] = true;
    var opts = assign({}, watchify.args, customOpts);
    var b = watchify(browserify(opts));

    b.transform('babelify', {
        presets: ['es2015', 'react']
    })

    // on update recompile
    b.on('update', watch);
    b.on('log', gutil.log);

    return b.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify error'))
        .pipe(source('pleiofile.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('static/js/build'));
}

gulp.task('build', function() {
    var opts = assign({}, watchify.args, customOpts);
    var b = browserify(opts);

    b.transform('babelify', {
        presets: ['es2015', 'react']
    })

    b.on('log', gutil.log);

    return b.bundle()
            .pipe(source('pleiofile.js'))
            .pipe(buffer())
            .pipe(uglify())
            .on('error', gutil.log)
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('static/js/build'));
});

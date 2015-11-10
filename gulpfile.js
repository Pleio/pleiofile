var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');

var source = require('vinyl-source-stream');

var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');

var sourcemaps = require('gulp-sourcemaps');

var gutil = require('gulp-util');

var b = browserify({
    entries: 'static/js/src/pleiofile.jsx',
    extensions: ['.jsx'],
    debug: true
});

gulp.task('default', ['watch']);

gulp.task('watch', function() {
    gulp.watch('static/js/src', ['build-dev']);
});

gulp.task('build-dev', function() {
    return b.transform('babelify', {presets: ['es2015', 'react']})
            .bundle()
            .pipe(source('pleiofile.js'))
            .pipe(gulp.dest('static/js/build'));
});

gulp.task('build', function() {
    return b.transform('babelify', {presets: ['es2015', 'react']})
            .bundle()
            .pipe(source('pleiofile.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .on('error', gutil.log)
            .pipe(sourcemaps.write('maps'))
            .pipe(gulp.dest('static/js/build'));
});
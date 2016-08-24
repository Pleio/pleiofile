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
var sass = require('gulp-sass');
var envify = require('loose-envify');


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

gulp.task('css', function() {
    return gulp.src('static/css/src/pleiofile.scss')
    .pipe(sass({
        includePaths: ['./bower_components/bootstrap-sass/assets/stylesheets'],
    }))
    .pipe(gulp.dest('static/css/build'));
});

gulp.task('build', function() {
    var opts = assign({}, watchify.args, customOpts);
    var b = browserify(opts);

    b.transform('envify', {global: true, _: 'purge', NODE_ENV: 'production'})
     .transform('babelify', {
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

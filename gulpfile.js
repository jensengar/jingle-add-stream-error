var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    watch = require('gulp-watch');

gulp.task('default', function() {
    gulp.src('app.js')
        .pipe(browserify({
            insertGlobals : true,
            debug : !gulp.env.production
        }))
        .pipe(gulp.dest('./build'));
});

// Basic usage
gulp.task('watch', function(cb) {
    gulp.watch('./app.js', ['default']);
});
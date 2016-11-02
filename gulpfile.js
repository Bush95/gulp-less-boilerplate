var gulp = require('gulp'),
    less = require('gulp-less'),
    del = require('del'),
    cleanCss = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    server = require('gulp-server-livereload'),
    concat = require('gulp-concat'),
    cleanJs = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    purifyCss = require('gulp-purifycss'),
    runSequence = require('run-sequence'),
    autoprefixer = require('gulp-autoprefixer'),
    plumber = require('gulp-plumber');

gulp.task('build-clean', function () {
    return del(['dist', 'temp']);
});

gulp.task('styles', function() {
    return gulp.src('src/less/main.less')
    .pipe(plumber({
      handleError: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(less({compress: false}))
    .pipe(gulp.dest('temp/css'));
});

gulp.task('copyIndex', function() {
    return gulp.src('src/index.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('copyFav', function() {
    return gulp.src('src/favicon/*')
    .pipe(gulp.dest('dist/favicon'));
});

gulp.task('copyImages', function() {
    return gulp.src('src/images/*')
    .pipe(gulp.dest('dist/images'));
});

gulp.task('copyMinImages', function() {
    return gulp.src('src/images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'));
});

gulp.task('concatBs', function () {
    return gulp.src(['node_modules/bootstrap-grid/dist/grid.css', 'temp/css/main.css'])
    .pipe(concat('main.css'))
    .pipe(gulp.dest('temp/css'));
});

gulp.task('cleanJs', function () {
    return gulp.src('temp/js/main.js')
    .pipe(cleanJs())
    .pipe(gulp.dest('temp/js'));
});

gulp.task('concatJs', function() {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js', 'src/js/main.js'])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('temp/js'));
});

gulp.task('minCss', function () {
    return gulp.src('temp/css/main.css')
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(purifyCss(['dist/index.html', 'temp/js/main.js']))
    .pipe(cleanCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('minJs', function () {
    return gulp.src('temp/js/main.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});


gulp.task('devCss', function() {
    return gulp.src('temp/css/main.css')
    .pipe(gulp.dest('dist/css'));
});

gulp.task('devJs', function () {
    return gulp.src('temp/js/main.js')
    .pipe(gulp.dest('dist/js'));
});

gulp.task('watch', function() {
    gulp.watch('src/index.html', ['copyIndex']);
    gulp.watch('src/less/*', () => runSequence('styles', 'concatBs', 'devCss'));
    gulp.watch('src/js/*.js', () => runSequence('concatJs', 'devJs'));
    gulp.watch('src/images/*', ['copyImages']);
});

gulp.task('server', function() {
    return gulp.src('dist')
      .pipe(server({
        livereload: true,
        open: true
      }))
});

gulp.task('dev', function () {
  runSequence('build-clean',
              'cleanJs',
              'concatJs',
              'devJs',
              'copyIndex',
              'copyImages',
              'styles',
              'concatBs',
              'devCss',
              'server',
              'watch');
});

gulp.task('default', ['dev']);

gulp.task('production', function (callback) {

  runSequence('build-clean',
              'copyIndex',
              'copyFav',
              'copyMinImages',
              'styles',
              'concatJs',
              'cleanJs',
              'minJs',
              'concatBs',
              'minCss',
              callback);
  }
);

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const rollup = require('gulp-rollup');
const sass = require('gulp-sass');
const sizereport = require('gulp-sizereport');
const livereload = require('gulp-livereload');
const clean = require('gulp-clean');
const uglify = require('gulp-uglifyjs');
const cleanCSS = require('gulp-clean-css');
var closureCompiler = require('gulp-closure-compiler');

gulp.task('sizereport', ['javascript', 'styles', 'copy-images'], () =>
  gulp.src('dist/public')
      .pipe(sizereport({
        gzip: true
      }))
);

gulp.task('copy-images', function () {
  gulp.src('public/images/**/*')
      .pipe(gulp.dest('./dist/public/images'));
});

gulp.task('copy-data', function () {
  gulp.src('public/data/*')
      .pipe(gulp.dest('./dist/public/data'));
});

gulp.task('copy-data-prod', function () {
  gulp.src('public/data/*')
      .pipe(uglify())
      .pipe(gulp.dest('./dist/public/data'));
});

gulp.task('styles', () =>
  gulp.src('public/stylesheets/style.sass')
      .pipe(sourcemaps.init())
      .pipe(sass({ outputStyle: 'compact' }).on('error', sass.logError))
      .pipe(autoprefixer({
        browsers: 'last 4 versions',
      }))
      .pipe(sourcemaps.write('../maps'))
      .pipe(gulp.dest('dist/public/stylesheets'))
);


gulp.task('styles-prod', () =>
  gulp.src('public/stylesheets/style.sass')
      .pipe(sourcemaps.init())
      .pipe(sass({ outputStyle: 'compact' }).on('error', sass.logError))
      .pipe(autoprefixer({
        browsers: 'last 4 versions',
      }))
      .pipe(sourcemaps.write('../maps'))
      .pipe(cleanCSS())
      .pipe(gulp.dest('dist/public/stylesheets'))
);

gulp.task('javascript', function () {
  gulp.src('public/javascripts/**/*.js')
      .pipe(sourcemaps.init())
      .pipe(rollup({
        entry: 'public/javascripts/index.js',
        dest: 'dist/bundle.js',
        format: 'iife',
        moduleName: 'AK'
      }))
      .pipe(sourcemaps.write('../maps'))
      .pipe(gulp.dest('dist/public/javascripts'))
      .pipe(livereload());
});

gulp.task('javascript-prod', function () {
  gulp.src('public/javascripts/**/*.js')
      .pipe(sourcemaps.init())
      .pipe(rollup({
        entry: 'public/javascripts/index.js',
        dest: 'dist/bundle.js',
        format: 'iife',
        moduleName: 'AK'
      }))
      .pipe(sourcemaps.write('../maps'))
      .pipe(uglify())
      .pipe(gulp.dest('dist/public/javascripts'))
      .pipe(livereload());
});

gulp.task('clean', function () {
  return gulp.src('dist/**/*', { read: false })
             .pipe(clean({ force: true }))
});

gulp.task('watch', ['javascript', 'styles', 'copy-images', 'copy-data', 'sizereport'], () => {
  livereload.listen();
  gulp.watch('public/javascripts/**/*.js', ['javascript']);
  gulp.watch('public/stylesheets/**/*.sass', ['styles']);
  gulp.watch('public/images/**/*', ['copy-images']);
  gulp.watch('public/data/*', ['copy-data']);
  gulp.watch('public/**/*', ['sizereport']);
});

gulp.task('prod', ['javascript-prod', 'styles-prod', 'copy-images', 'copy-data']);


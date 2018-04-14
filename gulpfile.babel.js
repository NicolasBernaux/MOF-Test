/*
 * Dependencies
 */
import gulp from 'gulp';
import rename from 'gulp-rename';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import imagemin from 'gulp-imagemin';
import uglify from 'gulp-uglify';
import sourcemaps from 'gulp-sourcemaps';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import gulpNotify from 'gulp-notify';
import cachebust from 'gulp-cache-bust';

/*
 * Configurations
 */
const config = {
  src: 'src/',
  dist: 'dist/',
  index: {
    src: 'src/*.html',
    dest: 'dist/',
  },
  pages: {
    src: 'src/views/*.**',
    dest: 'dist/views/',
  },
  images: {
    src: 'src/img/**',
    dest: 'dist/img/',
  },
  sounds: {
    src: 'src/sounds/**',
    dest: 'dist/sounds/',
  },
  sass: {
    src: 'src/scss/**/**.scss',
    dest: 'dist/css',
  },
  js: {
    src: 'src/js/',
    app: 'src/js/app.js',
    dest: 'dist/js',
  },
  fonts: {
    src: 'src/fonts/**',
    dest: 'dist/fonts',
  },
  files: {
    src: 'src/files/**',
    dest: 'dist/files',
  },
  htaccess: {
    src: 'src/.htaccess',
    dest: 'dist/',
  },
  server: 'dist/',
};


/*
 * Error
 */
const onError = (err) => {
  return gulpNotify({
    title: 'Error',
    message: err.message,
  }).write(err);

  console.log(err.toString());
  this.emit('end');
};

/*
 * htaccess
 */
gulp.task('htaccess', () => {
  return gulp.src([config.htaccess.src])
    .pipe(gulp.dest(config.htaccess.dest));
});

/*
 * index
 */
gulp.task('index', () => {
  return gulp.src([config.index.src])
    .pipe(cachebust({
      type: 'timestamp',
    }))
    .pipe(gulp.dest(config.index.dest));
});

/*
 * Pages
 */
gulp.task('pages', () => {
  return gulp.src([config.pages.src])
    .pipe(cachebust({
      type: 'timestamp',
    }))
    .pipe(gulp.dest(config.pages.dest));
});

/*
 * Fonts
 */
gulp.task('fonts', () => {
  return gulp.src([config.fonts.src])
    .pipe(gulp.dest(config.fonts.dest));
});

/*
 * Files
 */
gulp.task('files', () => {
  return gulp.src([config.files.src])
    .pipe(gulp.dest(config.files.dest));
});

/*
 * Images
 */
gulp.task('img', () => {
  return gulp.src([config.images.src])
    .pipe(imagemin())
    .pipe(gulp.dest(config.images.dest));
});

/*
 * Sounds
 */
gulp.task('sound', () => {
  return gulp.src([config.sounds.src])
    .pipe(gulp.dest(config.sounds.dest));
});

/*
 * SASS
 */
gulp.task('css', () => {
  return gulp.src([config.sass.src])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }))
    // .pipe(shorthand())
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'ie >= 11'],
      cascade: false,
    }))
    .pipe(rename((path) => {
      path.basename += '.min';
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.sass.dest));
});

/*
 * Browser-sync
 */
gulp.task('server', () => {
  browserSync.init({
    server: {
      baseDir: './dist',
    },
    notify: false,
    // tunnel: 'nicolasb',
    scroll: false,
  });
});

/*
 * JS
 */
gulp.task('js', () => {
  return browserify({
    entries: config.js.app,
    debug: true,
  })
    .transform(babelify, {presets: ['babel-preset-env'].map(require.resolve)})
    .bundle()
    .on('error', onError)
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.js.dest));
});

/*
 * Reload Pag
 */
gulp.task('reload', (done) => {
  browserSync.reload();
  done();
});

/*
 * Watch Task
 */
gulp.task('watchTask', () => {
  gulp.watch(config.images.src, gulp.parallel('img', 'reload'));
  gulp.watch(config.sounds.src, gulp.parallel('sound', 'reload'));
  gulp.watch(config.sass.src, gulp.parallel('css', 'reload'));
  gulp.watch(config.js.src, gulp.parallel('js', 'reload'));
  gulp.watch(config.pages.src, gulp.parallel('pages', 'reload'));
  gulp.watch(config.index.src, gulp.parallel('index', 'reload'));
});

gulp.task('run', gulp.parallel('htaccess', 'index', 'pages', 'img', 'js', 'css', 'fonts', 'sound', 'watchTask', 'server'));
gulp.task('default', gulp.parallel('htaccess', 'index', 'pages', 'img', 'js', 'css', 'fonts', 'sound'));

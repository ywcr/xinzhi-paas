var gulp = require('gulp');//图片压缩
// htmlmin = require('gulp-htmloptimize')
// var gutil = require('gulp-util');
// var gulpif = require('gulp-if'); //用于判断生产环境
// gulpLoadPlugins = require('gulp-load-plugins'),
// revReplace = require('gulp-rev-replace');//换引用的加了md5后缀的文件名，修改过，用来加cdn前缀
// var swig = require('gulp-swig');
// var frontMatter = require('gulp-front-matter');

// gulp.task('minify', function() {
//   gulp.src('./src/assets/*.html')
//     .pipe(htmlmin({collapseWhitespace: true, ignorePath: '/assets' }))
//     .pipe(gulp.dest('./dist'))
// });
// svg merge
var svgSymbols = require('gulp-svg-symbols');
var svgmin = require('gulp-svgmin')
gulp.task('svgbuild', ['minsvg', 'svg'])

gulp.task('minsvg', function() {
  return gulp.src('./static/img/**/*.svg')
    .pipe(svgmin())
    .pipe(gulp.dest('./static/img/svgMin'))
})

gulp.task('svg', ['minsvg'], function () {
  return gulp.src('./static/img/svgMin/**/*.svg')
    .pipe(svgSymbols())
    .pipe(gulp.dest('./static/img/sider/svg/'));
})
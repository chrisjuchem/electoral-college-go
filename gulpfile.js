// https://www.labnol.org/code/bundle-react-app-single-file-200514
const gulp = require('gulp');
const inline = require('gulp-inline');

gulp.task('default', () => {
  return gulp
    .src('./build/*.html')
    .pipe(
      inline({
        // base: https://npmmirror.com/package/gulp-inline
        disabledTypes: ['svg', 'img'],
      })
    )
    .pipe(gulp.dest('./build'));
}); 

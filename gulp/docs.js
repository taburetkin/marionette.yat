import gulp from 'gulp';
import concat from 'gulp-concat-util';
import sort from 'gulp-sort';

const createDocs = function() {
	return gulp.src(['!**/README.md','./docs/behaviors/**/*.md'])
	.pipe(sort())
	.pipe(concat('README.md'))
    .pipe(gulp.dest(function(file){
		return file.base;
	}));
};

gulp.task('docs', createDocs);

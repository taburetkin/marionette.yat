import gulp from 'gulp';
import concat from 'gulp-concat-util';
import sort from 'gulp-sort';
import _ from 'underscore';
import fs from 'fs';
import path from 'path';
import merge from 'merge-stream';
import gulpSequence  from 'gulp-sequence';

let docsPath = './docs';
let antiPattern = '!**/README.md';

function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
}


const createDocs = function() {
	return gulp.src(['!**/README.md','./docs/**/*.md'])
	.pipe(sort())
	.pipe(concat('README.md'))
    .pipe(gulp.dest(function(file){
		let arr = _(file).map((v,k) => k)
		console.log(arr);
		console.log(file.cwd);
		console.log(file.base);
		return file.base;
	}));
};

gulp.task('docs', createDocs);

gulp.task('docs2', () => {
	var folders = getFolders(docsPath);
	
	console.log('hello', folders);

	var nested = folders.map(function(folder) {
		let dst = path.join(docsPath, folder);
		let src = path.join(dst, '/**/*.md');
		return gulp.src([antiPattern, src])
				.pipe(sort())
				.pipe(concat('README.md'))
				.pipe(gulp.dest(dst));
	 });	

	 var rootMds = path.join(docsPath, '/*.md');
	 
	 var root = gulp.src([antiPattern, rootMds])
				.pipe(sort())
				.pipe(concat('.readme.md'))
				.pipe(gulp.dest(docsPath));

	var createMds = merge(nested, root);
	
	var rootMd = path.join(docsPath, '/.readme.md');
	var allMds = path.join(docsPath, '/**/README.md');
	 var finalize = gulp.src([rootMd,allMds])
	 .pipe(sort())
	 .pipe(concat('README.md'))
	 .pipe(gulp.dest(docsPath));


	 return gulpSequence(createMds, finalize);

	 //return createMds;
});

gulp.task('docsMerge',() => {


});

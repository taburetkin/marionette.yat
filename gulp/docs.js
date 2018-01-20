import gulp from 'gulp';
import concat from 'gulp-concat-util';
import sort from 'gulp-sort';
import _ from 'underscore';
import fs from 'fs';
import path from 'path';
import merge from 'merge-stream';
import gulpSequence  from 'gulp-sequence';
import glob from 'glob';
import clean from 'gulp-clean';


// let docsPath = './docs';
// let antiPattern = '!**/README.md';

// function getFolders(dir) {
//     return fs.readdirSync(dir)
//       .filter(function(file) {
//         return fs.statSync(path.join(dir, file)).isDirectory();
//       });
// }


// const createDocs = function() {
// 	return gulp.src(['!**/README.md','./docs/**/*.md'])
// 	.pipe(sort())
// 	.pipe(concat('README.md'))
//     .pipe(gulp.dest(function(file){
// 		let arr = _(file).map((v,k) => k)
// 		console.log(arr);
// 		console.log(file.cwd);
// 		console.log(file.base);
// 		return file.base;
// 	}));
// };

//gulp.task('docs', createDocs);

// gulp.task('docs2', () => {
// 	var folders = getFolders(docsPath);
	
// 	var nested = folders.map(function(folder) {
// 		let dst = path.join(docsPath, folder);
// 		let src = path.join(dst, '/**/*.md');
// 		return gulp.src([antiPattern, src])
// 				.pipe(sort())
// 				.pipe(concat('README.md'))
// 				.pipe(gulp.dest(dst));
// 	 });	

// 	 var rootMds = path.join(docsPath, '/*.md');
	 
// 	 var root = gulp.src([antiPattern, rootMds])
// 				.pipe(sort())
// 				.pipe(concat('.readme.md'))
// 				.pipe(gulp.dest(docsPath));

// 	var createMds = merge(nested, root);

// 	return createMds;
	
// 	var rootMd = path.join(docsPath, '/.readme.md');
// 	var allMds = path.join(docsPath, '/**/README.md');
// 	 var finalize = gulp.src([rootMd,allMds])
// 	 .pipe(sort())
// 	 .pipe(concat('README.md'))
// 	 .pipe(gulp.dest(docsPath));


// 	 return gulpSequence(createMds, finalize);

// });


gulp.task('docs3', gulpSequence('docsClean','createDocsInFolders', 'mainReadMeContent', 'mainReadMe', 'docscopy2src' ))

gulp.task('docsClean',() =>{
	gulp.src('./docs/**/README.md', {read: false})
	.pipe(clean())
});

gulp.task('createDocsInFolders',() => {

	let folders = [];
	glob.sync('./docs/**/*').forEach(function(filePath) {
		if (fs.statSync(filePath).isDirectory()) {
			folders.push(filePath);
		}
	});



	var folderTasks = folders.map((folder) => {
		let pattern = path.join(folder, '/*.md');
		let antipattern = "!" + path.join(folder, '/README.md');
		return gulp.src([antipattern, pattern])
				.pipe(sort())
				.pipe(concat('README.md'))
				.pipe(gulp.dest(folder));
	});

	return folderTasks;
});

gulp.task('mainReadMeContent', function(cb){
	function getLast(txt, splitBy){
		var res = {};
		var arr = txt.split(splitBy);
		if(arr.length > 1)
			res.last = arr.pop();
		res.rest = arr.join(splitBy);
		return res;
	}

	function parsePath(path){
		if(path == null) return;
		var res = { path };
		var ext = getLast(path, '.');
		res.ext = ext.last;
		var name = getLast(ext.rest, '/');
		res.name = name.last;
		res.folderPath = name.rest;
		var folder = getLast(name.rest, '/');
		res.folder = folder.last;
		var tmp = res.folderPath.split('/');
		res.level = tmp.length - 1;
		res.pathArray = path.split('/');
		res.pathArray.pop();
		return res;
	}


	function forceFolder(hash, arr, parent = {level:-2, path:''}){
		if(!arr.length) return;
		let chunk = arr.shift();
		var folder = hash[chunk];
		if(!folder){
			folder = hash[chunk] = { 
				name: chunk,
				level: parent.level + 1, 
				files:{},
				folders:{},
				path: parent.path + '/' + chunk
			};
			folder.md = (folder.level > 0 ? "\t".repeat(folder.level) : "") + '* [`'+chunk+'`]('+folder.path+')\r\n';
		}
		if(!arr.length)
			return folder;
		else
			return forceFolder(folder.folders, arr, folder);
	}

	function createMdHash2(hash, path){
		function nu(url){
			if(url.startsWith('.'))
				return url.substring(1);
			return url;
		}


		var objpath = nu(path.folderPath).substring(1);
		var arrobjpath = objpath.split('/');
		var folderObject = forceFolder(hash, arrobjpath);

		if(path.name.toLowerCase() == path.folder.toLowerCase()) return;

		folderObject.files[path.name] = {
			name: path.name,
			md: '\t'.repeat(folderObject.level + 1) + '* `'+ path.name + '`\r\n'
		}
	}


	function getFilesTree()
	{
		let files = [];
		let hash = {};
		let exclude = ['marionette.yat','mixin'];

		glob.sync('./src/**/*.js').forEach(function(filePath) {
			if (fs.statSync(filePath).isFile()) {
				var res = parsePath(filePath);
				if(res.name.startsWith('_') || exclude.indexOf(res.name)>=0) return
				createMdHash2(hash, res);
			}
		});
		var text = '';


		function buildMd(obj){
			if(obj.name != 'src') text += obj.md;
			_(obj.folders).each((folder) => buildMd(folder));
			_(obj.files).each((file) => { text += file.md });
		}

		buildMd(hash.src)
		return text;
	}

	let content = getFilesTree();
	content = "## table of contents \r\n\r\n" + content;
	fs.writeFile('./middle.md', content, cb);
});

gulp.task('mainReadMe',() => {
	return gulp.src(['./banner.md','./middle.md','./footer.md'])	
	.pipe(concat('README.md'))
	.pipe(gulp.dest('./'));
});

gulp.task('docscopy2src',() => {
	return gulp.src('./docs/**/README.md')
	.pipe(gulp.dest('./src'));
});

// gulp.task('docscontent',() => {

// 	let files = [];
// 	let hash = {};
// 	let exclude = ['marionette.yat','mixin'];

// 	glob.sync('./src/**/*.js').forEach(function(filePath) {
// 		if (fs.statSync(filePath).isFile()) {
// 			var res = parsePath(filePath);
// 			if(res.name.startsWith('_') || exclude.indexOf(res.name)>=0) return
// 			createMdHash2(hash, res);
// 		}
// 	});
// 	var text = '';


// 	function buildMd(obj){
// 		if(obj.name != 'src') text += obj.md;
// 		_(obj.folders).each((folder) => buildMd(folder));
// 		_(obj.files).each((file) => { text += file.md });
// 	}

// 	buildMd(hash.src)
// 	return text;
// });







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
import str  from 'string-to-stream';
import source  from 'vinyl-source-stream';

import wait from 'gulp-wait';




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
		path: path.path,
		md: '\t'.repeat(folderObject.level + 1) + '* `'+ path.name + '`\r\n'
	}
}

function getJsTree()
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

	return hash;
}



gulp.task('docs3', gulpSequence('docsClean','createDocsInFolders', 'mainReadMeContent', 'mainReadMe', 'docscopy2src' ))

gulp.task('docsClean',() =>{
	gulp.src('./docs/**/README.md', {read: false})
	.pipe(clean());
	gulp.src('./src/**/README.md', {read: false})
	.pipe(clean());
	
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



	function getOldFilesTree()
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



	let content = getOldFilesTree();
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




gulp.task('createDocsInFolders2',() => {
	let docsFiles = getJsToDocs();
	let docsFolders = getDocsFolders();
	let res = getJsTree();
	let hash = {};
	_(res).each((value, name) => {
		traverseFolders(value, docsFolders, docsFiles, hash);
	});
	let files = _(hash).map((content, path) => {
		let ps = parsePath(path);
		return str(content).pipe(source(ps.name + '.md')).pipe(gulp.dest(ps.folderPath));
	})

	let full = createFullTree(res, docsFolders, docsFiles);

	let merged = merge(files, full);
	//let wait = [gulp.src('./LICENSE').pipe(wait(2000))];
	return merged;
	//str('1.4.27').pipe(source('version.txt')).pipe(gulp.dest('dist'));

	//console.log(hash);
});

gulp.task('mainReadMe2',() => {
	return gulp.src(['./banner.md','./src/README.md','./footer.md'])	
	.pipe(concat('README.md'))
	.pipe(gulp.dest('./'));
});

gulp.task('docs', gulpSequence('docsClean','wait1000','createDocsInFolders2', 'wait1000', 'mainReadMe2' ))

gulp.task('wait1000', () => {

	return gulp.src('./LICENSE')
			.pipe(wait(500));

});

function getJsToDocs(){
	let docs = {};
	glob.sync('./docs/**/*').forEach(function(filePath) {
		if (fs.statSync(filePath).isFile()) {
			let parsed = parsePath(filePath);
			if(parsed.name.toLowerCase() === parsed.folder.toLowerCase()) return;
			let js = filePath.replace(/^.\/docs/,'./src').replace(/\.md$/,'.js');
			docs[js] = filePath.substring(1);
		}
	});
	return docs;
}

function getDocsFolders(){
	let docs = {};
	glob.sync('./docs/**/*').forEach(function(filePath) {
		if (fs.statSync(filePath).isDirectory()) {
			//let parsed = parsePath(filePath);
			//if(parsed.name.toLowerCase() === parsed.folder.toLowerCase()) return;
			let js = filePath.replace(/^.\/docs/,'/src').replace(/\.md$/,'.js');
			docs[js] = filePath.substring(1);
		}
	});
	return docs;
}

function createFolderReadme(root, docsFolders, docsFiles, level){
	//console.log('>', `.${root.path}/README.md`);
	let separate = level == null;
	if(level == null)
		level = root.level;

	let text = '';
	let name = root.name == 'src' ? 'marionette.yat' : root.name;
	text += tab(`# ${root.name}\r\n`);
	_(root.folders).each((folder) => {
		text += tab(`* [${folder.name}](${folder.path})\r\n`);
	});
	if(_.size(root.files)){
		if(separate)
			text += '\r\n' + tab(`## content\r\n`);
		_(root.files).each((file) => {
			if(file.path in docsFiles){
				text += tab(`* [${file.name}](${docsFiles[file.path]})\r\n`);
			} else {
				text += tab(`* ${file.name}\r\n`);
			}
		});
	}
	if(separate){
		return { path:`.${root.path}/README.md`, content: text };
	} else {
		return text;
	}
}

function createFullTree(res, docsFolders, docsFiles){
	let result = '## marionette.yat content \r\n';
	_(res).each((value, name) => {		
		result += createFullFolderText(value, docsFolders, docsFiles);
	});
	return str(result).pipe(source('README.md')).pipe(gulp.dest('./src'));
}

function createFullFolderText(root, docsFolders, docsFiles){
	let text = '';
	let name = root.name == 'src' ? 'marionette.yat' : root.name;
	name = `* [${name}](.${root.path})`;
	if(root.level >= 0)
		text += tab(`${name}\r\n`, root.level);
	_(root.folders).each((folder) => {
		text += createFullFolderText(folder, docsFolders, docsFiles)
	});
	_(root.files).each((file) => {
		let filename = '';
		if(file.path in docsFiles){
			filename = `[${file.name}](${docsFiles[file.path]})`;
		} else {
			filename = file.name;
		}
		text += tab(`* ${filename}\r\n`, root.level + 1)
	});	
	return text;
}


function traverseFolders(root, docsFolders, docsFiles, hash){
	
	if(root.path !== '/src'){
		let result = createFolderReadme(root, docsFolders, docsFiles);
		hash[result.path] = result.content;
	}

	_(root.folders).each((folder) => traverseFolders(folder, docsFolders, docsFiles, hash));
	return hash;
}

function tab(text, level){
	if(level > 0)
		text = '\t'.repeat(level) + text;
	return text;
}


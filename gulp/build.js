import gulp from 'gulp';
import clean from 'gulp-clean';

import uglifyjs from 'uglify-es';
import runSequence from 'run-sequence';
import fs from 'fs';

import { rollup } from 'rollup';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import rollupClean from 'rollup-plugin-clean';

import banner from './_banner';
import pkg from '../package.json';

const srcPath = 'src/';
const distPath = './dist/**/*';

const rollupGlobals = {
	'jquery':'$',
	'underscore': '_',
	'backbone': 'Backbone',
	'backbone.radio': 'Backbone.Radio',
	'backbone.marionette': 'Marionette'
};

function makeESModule(bundle) {
  bundle.write({
	format: 'es',
	name: 'MarionetteYat',
    file: 'dist/marionette.yat.esm.js',
    sourcemap: true,
    sourcemapFile: 'marionette.yat.esm.js',
    banner: banner,
    globals: rollupGlobals
  });
}

function generateBundle(bundle) {
  return bundle.generate({
    format: 'umd',
    name: 'MarionetteYat',
    sourcemap: true,
    sourcemapFile: 'marionette.yat.js',
    banner: banner,
    footer: 'this && this.Marionette && (this.Marionette.Yat = this.MarionetteYat);',
    globals: rollupGlobals
  });
}

function makeBundle(buildPath, entry) {
  const buildFile = buildPath + pkg.name + '.js';
  entry || (entry = srcPath + pkg.name + '.js');
  return rollup({
    input: entry,
    external: ['jquery', 'underscore', 'backbone', 'backbone.radio','backbone.marionette'],
    plugins: [
		rollupClean(),
		json(),
		babel({
			sourceMaps: true,
			presets: [['es2015', {modules: false}]],
			babelrc: false
		})
    ]
  }).then(bundle => {
    // Only build the ES6 module if this is the main build
    if (buildFile === pkg.main) {
      makeESModule(bundle);
    }
    return generateBundle(bundle);
  });
}

function build(buildPath, entry, output, doMinify) {
	// gulp.src(distPath, {read: false})
	// .pipe(clean());
  //if(doMinify == null) doMinify = true;

  return makeBundle(buildPath, entry).then(gen => {
	output || (output = pkg.name);
    fs.writeFileSync(buildPath + output + '.js', gen.code  +
      '//# sourceMappingURL=' + output + '.js.map\n' );
	fs.writeFileSync(buildPath + output + '.js.map', gen.map.toString());
	
	if(doMinify != false){

		var minified = uglifyjs.minify(gen.code, {
			sourceMap: {
				content: gen.map,
				filename: output + '.min.js',
				url: output + '.min.js.map'
			},
			output: {
				comments: 'some'
			}
		});

		if (minified.error) {
		throw 'uglify-js error: ' + minified.error
		}
		fs.writeFileSync(buildPath + output + '.min.js', minified.code);
		fs.writeFileSync(buildPath + output + '.min.js.map', minified.map);
	}
	
  });
}

gulp.task('build-test', ['lint-test'], function() {
  return build('tmp/lib/');
});

gulp.task('build-lib', ['lint-src'], function() {
  return build('dist/');
});

gulp.task('build', function(done) {
  runSequence('build-lib', done);
});


gulp.task('build-board', function() {
	return build('demo/kb/','demo/kb/index.js','kanban-board');
});

var fs = require('fs');
var browserify = require('browserify');
var watchify = require('watchify');
var hmr = require('browserify-hmr');
// var sassify = require('sassify');
// var extractCss = require('vueify/plugins/extract-css')


var b = browserify({
  entries: ['src/main.js'],
  cache: {},
  debug: true,
  packageCache: {},
  plugin: [watchify, hmr]
});

b.on('update', bundle);
bundle();

function bundle() {
  console.log("bundle");
  b.transform('browserify-css', {
      minify: true,
      output: 'dist/build.css'
    })

    // b.transform(sassify, {
    //     base64Encode: false, // Use base64 to inject css
    //     sourceMap: true,
    //     // 'no-auto-inject': false
    //   })
    // b.plugin('vueify/plugins/extract-css', {
    //     out: 'dist/bundle.css' // can also be a WritableStream
    //   })

    .bundle()
    .pipe(fs.createWriteStream('dist/build.js'));
}
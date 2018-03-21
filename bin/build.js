var fs = require('fs');
var browserify = require('browserify');
var sassify = require('sassify');
var envify = require('envify/custom')

var b = browserify({
  entries: ['src/main.js'],
  cache: {},
  packageCache: {},
});

console.log("bundle");
b.transform('browserify-css', {
    minify: true,
    output: 'dist/build.css'
  })
  .transform({
      global: true
    },
    envify({
      NODE_ENV: 'production'
    })
  )
  .bundle()
  .pipe(fs.createWriteStream('dist/build.js'));
// }
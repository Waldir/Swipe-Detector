// Require the gulp components
const { src, dest, watch, parallel } = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-terser');
const rename = require('gulp-rename');
const browserSync = require('browser-sync');
const osPath = require('path');
const replace = require('gulp-replace');
const fs = require('fs');
const pJson = require('./package.json');

function buildJs() {
    return src('src/*.js')
        .pipe(babel({ presets: [[
            '@babel/preset-env',
            {
                exclude: ['@babel/plugin-transform-typeof-symbol'],
                modules: false,
            },
        ]] }))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js', dirname: '' }))
        .pipe(replace(new RegExp('@version@', 'g'), pJson.version))
        .pipe(dest('dist'))
        .pipe(browserSync.stream());
}

/**
* Used to sync deleing and renaming files
* @param {String} action Action taken on the file
* @param {String} path Path of the file
*/
function fileSync(action, path) {
    const devPath = osPath.relative(osPath.resolve('src'), path);
    const destPath = osPath.resolve('dist', devPath);
    if (fs.existsSync(destPath)) {
        if (action === 'unlink')
            fs.unlinkSync(destPath);
        if (action === 'change')
            rename(destPath);
    }
}

/**
* Use BrowserSync
*/
function bSync() {
    browserSync.init({
        watch:         true,
        injectChanges: true,
        open:          true,
        ghostMode:     false,
        baseDir:       '.',
        server:        '.',
        directory:     true,
    });
}

/**
* We watch for changes.
*/
function watchMe() {
    watch('src/**/*.js', buildJs);
    watch('src/**/*').on('all', fileSync);
    browserSync.reload();
}

// Processed Files
exports.js    = buildJs;
exports.watch = watchMe;

// Export tasks
exports.default = parallel(
    bSync,
    exports.js,
    exports.watch,
);

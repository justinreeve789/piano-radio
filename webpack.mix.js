const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.options({
    uglify: {
        uglifyOptions: {
            compress: true,
            mangle: true,
            output: {
                comments: false,
                beautify: false
            }
        }
    }
});

mix.js('resources/js/app.js', 'public/js').vue();

mix.sass('resources/sass/app.scss', 'public/css')
    .sass('resources/sass/mobile.scss', 'public/css')
    .sass('resources/sass/settings_christian.scss', 'public/css')
    .sass('resources/sass/settings_christmaspiano.scss', 'public/css')
    .sass('resources/sass/settings_epicmusic.scss', 'public/css')
    .sass('resources/sass/settings_metal.scss', 'public/css')
    .sass('resources/sass/settings_piano.scss', 'public/css')
    .sass('resources/sass/site.scss', 'public/css')
    .sass('resources/sass/artist.scss', 'public/css')
    .sass('resources/sass/home.scss', 'public/css');

mix.copyDirectory('resources/fonts', 'public/fonts');
mix.copyDirectory('resources/images', 'public/images');

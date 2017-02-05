module.exports = function (grunt) {

    grunt.initConfig({
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'www/static/css/styles.min.css': [
                        'www/static/css/reset.css',
                        'www/static/css/grid.css',
                        'www/static/css/general.css',
                        'www/static/css/header.css',
                        'www/static/css/map_area.css',
                        'www/static/css/modals.css',
                        'www/static/css/aside.css'
                    ]
                }
            }
        },
        uglify:{
            options:{
                banner:'/*Created by Nuno Machado*/\n'
            },
            build:{
                files:{
                    'www/static/src/main.min.js':['www/static/src/MapView.js','www/static/src/Model.js', 'www/static/src/ViewModel.js']
                }
            }
        }
    });

    //build tasks
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['cssmin', 'uglify']);
};

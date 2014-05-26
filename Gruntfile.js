'use strict';

module.exports = function (grunt) {

  grunt.initConfig({

    meta: {
      pkg: grunt.file.readJSON('package.json'),
      src: {
        js: [
          'src/form/form.js',
          'src/form/form-service.js',
          'src/form/form-directive.js',
          'src/notification/notification.js',
          'src/notification/notification-controller.js',
          'src/rest/rest.js',
          'src/utils/utils.js'
        ]
      }
    },

    clean: ['<%= destination_dir %>/bower_components', 'tmp', 'dist'],

    /* convert AngularJs html templates to cached JavaScript */
    html2js: {
      main: {
        options: {},
        src: ['src/**/*.tpl.html'],
        dest: 'tmp/<%= meta.pkg.name %>.templates.js'
      }
    },

    concat: {
      options: {
        separator: ';',
        banner: '/*!\n' +
          ' * <%= meta.pkg.name %> - v<%= meta.pkg.version %>\n' +
          ' * <%= meta.pkg.homepage %>\n\n' +
          ' * License: <%= meta.pkg.license %>\n' +
          ' * Date: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
          ' */\n'
      },
      dist: {
        src: ['<%= meta.src.js %>', 'tmp/*.js'],
        dest: 'dist/<%= meta.pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        // Preserve banner
        preserveComments: 'some'
      },
      dist: {
        files: {
          'dist/<%= meta.pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    jshint: {
      files: ['src/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-html2js');

  grunt.registerTask('default', ['clean', 'jshint', 'html2js', 'concat', 'uglify']);

};
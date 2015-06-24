/* 
 * @copyright 2015 CoNWeT Lab., Universidad Politécnica de Madrid
 * @license Apache v2 (http://www.apache.org/licenses/)
 */

module.exports = function(grunt) {

  'use strict';

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    isDev: grunt.option('target') === 'release' ? '' : '-dev',

    banner: ' * @version <%= pkg.version %>\n' +
            ' * \n' +
            ' * @copyright 2014 <%= pkg.author %>\n' +
            ' * @license <%= pkg.license.type %> (<%= pkg.license.url %>)\n' +
            ' */',

    compress: {
      widget: {
        options: {
          archive: 'build/<%= pkg.vendor %>_<%= pkg.name %>_<%= pkg.version %><%= isDev %>.wgt',
          mode: 'zip',
          level: 9,
          pretty: true
        },
        files: [
          {expand: true, src: ['**/*'], cwd: 'build/wgt'}
        ]
      }
    },

    concat: {
      dist: {
        src: grunt.file.readJSON("src/test/fixtures/json/wirecloudStyleDependencies.json"),
        dest: "build/helpers/StyledElements.js"
      }
    },

    copy: {
      main: {
        files: [
          {expand: true, src: ['**/*', '!test/**'], dest: 'build/wgt', cwd: 'src'},
          {expand: true, src: ['jquery.min.map', 'jquery.min.js'], dest: 'build/wgt/lib/js', cwd: 'node_modules/jquery/dist'},
          {expand: true, src: ['jquery.min.map', 'jquery.min.js'], dest: 'build/wgt/lib/js', cwd: 'node_modules/jquery/dist'},
          {expand: true, src: ['js/bootstrap.min.js', 'css/bootstrap.min.css', 'fonts/*'], dest: 'build/wgt/lib', cwd: 'node_modules/bootstrap/dist'},
          {expand: true, src: ['css/font-awesome.min.css', 'fonts/*'], dest: 'build/wgt/lib', cwd: 'node_modules/font-awesome'}
        ]
      }
    },
    
    karma: {
      headless: {
        configFile: 'karma.conf.js',
        options: {
          browsers: ['PhantomJS']
        }
      },

      all: {
        configFile: 'karma.conf.js',
      },

      debug: {
        configFile: 'karma.conf.js',
        options: {
          preprocessors: [],
          singleRun: false
        }
      }
    },

    replace: {
      version: {
        src: ['src/config.xml'],
        overwrite: true,
        replacements: [{
          from: /version="[0-9]+\.[0-9]+\.[0-9]+(-dev)?"/g,
          to: 'version="<%= pkg.version %>"'
        }]
      },
    },

    clean: ['build'],

    jshint: {
        options: {
            jshintrc: true
        },
        all: {
            files: {
                src: ['src/js/**/*.js']
            }
        },
        grunt: {
            options: {
                jshintrc: '.jshintrc-node'
            },
            files: {
                src: ['Gruntfile.js']
            }
        },
        test: {
            options: {
                jshintrc: '.jshintrc-jasmine'
            },
            files: {
                src: ['src/test/**/*.js', '!src/test/fixtures/', '!src/test/StyledElements/*']
            }
        }
    },

    wirecloud: {
      publish: {
        file: 'build/<%= pkg.vendor %>_<%= pkg.name %>_<%= pkg.version %>-dev.wgt'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-gitinfo');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-wirecloud');

  grunt.registerTask('manifest', 'Creates a manifest.json file', function() {

    this.requiresConfig('gitinfo');
    var current = grunt.config(['gitinfo', 'local', 'branch', 'current']);
    var content = JSON.stringify({
      'Branch': current.name,
      'SHA': current.SHA,
      'User': current.currentUser,
      'Build-Timestamp': grunt.template.today('UTC:yyyy-mm-dd HH:MM:ss Z'),
      'Build-By' : 'Grunt ' + grunt.version
    }, null, '\t');
    grunt.file.write('build/wgt/manifest.json', content);
  });

  grunt.registerTask('package', ['gitinfo', 'manifest', 'copy', 'compress:widget']);
  grunt.registerTask('test', ['concat', 'karma:headless']);
  grunt.registerTask('default',
    ['jshint',
     'test',
     'replace:version',
     'package'
    ]);
};
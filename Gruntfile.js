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
          {expand: true, src: ['jquery.min.map', 'jquery.min.js'], dest: 'build/wgt/lib/js', cwd: 'node_modules/jquery/dist'}
        ]
      }
    },
    
    jasmine: {
      test: {
        src: ['src/js/*.js', '!src/js/main.js'],
        options: {
          specs: 'src/test/js/*Spec.js',
          helpers: ['src/test/helpers/*.js', 'build/helpers/*.js'],
          vendor: ['node_modules/jquery/dist/jquery.js',
            'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
            'src/test/vendor/*.js']
        }
      },

      coverage: {
        src: '<%= jasmine.test.src %>',
        options: {
          helpers: '<%= jasmine.test.options.helpers %>',
          specs: '<%= jasmine.test.options.specs %>',
          vendor: '<%= jasmine.test.options.vendor %>',
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions : {
            coverage: 'build/coverage/json/coverage.json',
            report: [
              {type: 'html', options: {dir: 'build/coverage/html'}},
              {type: 'cobertura', options: {dir: 'build/coverage/xml'}},
              {type: 'text-summary'}
            ]
          }
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

    deleteWidget: {
      // DELETE https://mashup.lab.fiware.org/api/resource/CoNWeT/openstack-imagedetails-widget/0.0.1?affected=true
    },

    uploadWidget: {
      // POST https://mashup.lab.fiware.org/api/resources

      // Request Headers
      // Accept:application/json
      // Accept-Encoding:gzip, deflate
      // Accept-Language:es-ES,es;q=0.8,en;q=0.6
      // Cache-Control:no-cache
      // Connection:keep-alive
      // Content-Length:243455
      // Content-Type:multipart/form-data; boundary=----WebKitFormBoundarywTrR0pdYAmFEXiCi
      // Cookie:oil_sid=abjh856ymduiy231axatu7a8n0wha6sr; policy_cookie=on
      // Host:mashup.lab.fiware.org
      // Origin:https://mashup.lab.fiware.org
      // Pragma:no-cache
      // Referer:https://mashup.lab.fiware.org/braulio/OpenStack
      // User-Agent:Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/40.0.2214.94 Chrome/40.0.2214.94 Safari/537.36
      // X-Requested-With:XMLHttpRequest

      // Request Payload
      // ------WebKitFormBoundarywTrR0pdYAmFEXiCi
      // Content-Disposition: form-data; name="force_create"

      // true
      // ------WebKitFormBoundarywTrR0pdYAmFEXiCi
      // Content-Disposition: form-data; name="file"; filename="CoNWeT_OpenStack-ImageDetails_0.0.1-dev.wgt"
      // Content-Type: application/octet-stream


      // ------WebKitFormBoundarywTrR0pdYAmFEXiCi
      // Content-Disposition: form-data; name="install_embedded_resources"

      // true
      // ------WebKitFormBoundarywTrR0pdYAmFEXiCi--
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
  grunt.registerTask('test', ['concat', 'jasmine:coverage']);
  grunt.registerTask('default',
    ['jshint',
     'test',
     'replace:version',
     'package'
    ]);
};
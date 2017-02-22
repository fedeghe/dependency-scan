#!/usr/bin/env node

var fs = require('fs'),
	path = require('path'),
    stringproto = require('./stringproto'),
    packageInfo = fs.existsSync(__dirname + '/package.json') ? require(__dirname + '/package.json') : {},
    log = function(msg) { console.log('• ' + msg) },
    execPath = process.cwd();


(function () {
    var requires = [],
        filesNum = 0,
        builtinModules = builtin(),
        frontendFiles = false;

    log((packageInfo.name + ' v. ' + packageInfo.version).underline() + ' looking into ' + execPath.white());
	
	function walk(dir, done) {
	    var results = [],
	    	tmp;

	    fs.readdir(dir, function(err, list) {
	        if (err) return done(err, results);

	        var pending = list.length,
	        	maybeFE = false;
	        if (!pending) return done(null, results);

			list.forEach(function(file) {
				file = path.resolve(dir, file);
				fs.stat(file, function(err, stat) {

					if (stat && stat.isDirectory() && !(file.match(/(node_modules|\.git|\.svn)$/))) {
						walk(file, function(err, res) {
							results = results.concat(res);
							if (!--pending) done(null, results);
						});
					} else {
						results.push(file);

						if (file.match(/\.js$/)) {
							content = fs.readFileSync(file) + "";
							tmp = matchallRequires(content);
							maybeFE = checkFE(content);
							frontendFiles = frontendFiles || maybeFE;
							if (tmp.length) {
								tmp.forEach(function (el) {
									el = maybeFE ? el+'*'.red() : el;
									requires.indexOf(el) < 0 && requires.push(el);
								});
			                }
	                    }

	                    if (!--pending) done(null, results);
	                }
	            });
	        });
	    });
	};


	walk(execPath, notifyResult);

	function notifyResult() {
		//sort
		requires = requires.sort(function(a, b){return a >= b ? 1 : -1;})

		console.log("\nDependency-locker found " + requires.length + " actual dependencies in Your code:")

		for (var i = 0, l = requires.length; i < l; i++) {
			// console.log(i + ": "+ requires[i]);
			console.log("> " + requires[i]);
		}
		if (frontendFiles) {
			console.log('*'.red() + ": most likely these names comes from frontend files.")
		}
		console.log("");
	}

	function checkFE(content) {
		return content.match(/\Wwindow\W/);
	}

	function matchallRequires (content) {
		var res = [],
			straight = true;
			rx = /require\(['|"]([^\.][^\'\"]*)['|"]\)/;
		while (straight) {
			if (!content.match(rx)) {
				straight = false;
			} else {
				content = content.replace(rx, function (str, $1) {
					builtinModules.indexOf($1) < 0 && res.push($1);
					return '';
				})
			}
		}
		return res;
	}

	function builtin() {
		var blacklist = ['freelist', 'sys'];
		return Object.keys(process.binding('natives')).filter(function (el) {
			return !/^_|^internal|\//.test(el) && blacklist.indexOf(el) === -1;
		}).sort();
	}
})();

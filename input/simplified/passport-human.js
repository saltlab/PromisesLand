/* Source example from: https://github.com/jaredhanson/passport/pull/243/files 
 * Note: This pull request was not accepted. */

/**
 * Module dependencies.
 */
var http = require('http')
  , req = http.IncomingMessage.prototype

/**
 * Intiate a login session for `user`.
 *
 * Examples:
 *
 *     req.logIn(user, true, function(err) { if(err) { throw err; } });
 *
 * @param {User} user
 * @param {Boolean} session
 * @param {Function} done - the callback to exec when finished
 * @api public
 */
req.logIn = function(user, session, done) {

  this[property] = 'user';

  if (session) {

    var self = this;

		/* The promise. */
    var promise = new Promise(

			function (resolve, reject) {

				/* The async call. */
				self._passport.instance.serializeUser(user, self, 
					
					function(err, obj) {

						if (err) { 
							self[property] = null; 
							return reject(err); 
						}

						self._passport.session.user = obj;
						resolve();

      	});
		});

    return promise.then(done).catch(done);
  } 
	else {
    done();
    return Promise.resolve();
  }
};

'use strict';
/*** Passport Middlewares */

const passport = require('passport');

/* Misc */
const toolset = require('toolset');
function auth(options) {
  const scope = {
    returnRaw: options.returnRaw || false,
    app: options.app || {},
    onAuth: options.onAuth || function () { },
    url: options.url || 'http://127.0.0.1',
    logout: options.logout || { url: '/api/logout', after: '/' },

    // Special Cases
    // PassportJS doesn't have a standardized API, with its property names changing from Strategy to Strategy.
    // Here we fix that, taking social-login's standardized API and turning it into what Passportjs expects.
    specialCases: {
      twitter: {
        setup: {
          userAuthorizationURL: "https://api.twitter.com/oauth/authorize",
        },
        varChanges: {
          clientID: 'consumerKey',
          clientSecret: 'consumerSecret'
        }
      },
      linkedin: {
        varChanges: {
          clientID: 'consumerKey',
          clientSecret: 'consumerSecret'
        }
      },
      google: {
        varAdd: {
          callbackURL: function (settings) { return scope.url + settings.url.callback; }
        },
        varChanges: {
          clientID: 'clientId'
        }
      },
      meetup: {
        varChanges: {
          clientID: 'consumerKey',
          clientSecret: 'consumerSecret'
        }
      },
      tumblr: {
        varChanges: {
          clientID: 'consumerKey',
          clientSecret: 'consumerSecret'
        }
      }
    },

    // The strategy aliases
    map: {
      facebook: 'passport-facebook',
      google: 'passport-google-auth',
      twitter: 'passport-twitter',
      instagram: 'passport-instagram',
      linkedin: 'passport-linkedin',
      github: 'passport-github',
      amazon: 'passport-amazon',
      dropbox: 'passport-dropbox-oauth2',
      foursquare: 'passport-foursquare',
      imgur: 'passport-imgur',
      meetup: 'passport-meetup',
      wordpress: 'passport-wordpress',
      tumblr: 'passport-tumblr'
    },

    uniqueIds: {
      facebook: 'id',
      twitter: 'id',
      instagram: 'id',
      linkedin: 'id',
      github: 'id',
      google: 'id',
      amazon: 'id',
      dropbox: 'id',
      foursquare: 'id',
      imgur: 'id',
      meetup: 'id',
      wordpress: 'ID',
      tumblr: 'name'
    },

    // The strategy names
    // Some passport libs have more complex internal names than just the name of the service.
    strategyNameMap: {
      dropbox: 'dropbox-oauth2'
    },
    use: use,
    init: init,
    setup: setup,
    preparseProfileData: preparseProfileData,
    getUrl: getUrl
  }
  return scope;

  function use(settings) {
    this.settings = settings;
    this.init();
  }
  function init() {
    let scope = this;

    // Setup PassportJS
    this.app.use(passport.initialize());
    this.app.use(passport.session());
    passport.serializeUser(function (user, done) {
      done(null, user);
    });
    passport.deserializeUser(function (user, done) {
      done(null, user);
    });

    this.app.get(this.logout.url, function (req, res) {
      res.clearCookie('session_key');
      req.logout();
      res.redirect(scope.logout.after);
    });

    let type;
    for (type in this.settings) {
      this.setup(type, this.settings[type]);
    }
  }
  function getUrl(path) {
    //keep origin url with domain
    if (path && (path.startsWith('http') || path.startsWith('https'))) {
      return path
    }
    return this.url + path
  }
  function setup(type, settings) {
    let scope = this;
    if (!this.map[type]) {
      toolset.error("Error!", 'type "' + type + '" is not supported.');
      return false;
    }

    // Passport setup
    let passportSetup = {
      clientID: settings.settings.clientID,
      clientSecret: settings.settings.clientSecret,
      callbackURL: scope.getUrl(settings.url.callback),
      passReqToCallback: true
    };
    // Update the letiable names if needed, because Passport is unable to standardize things apparently.
    if (this.specialCases[type] && this.specialCases[type].varChanges) {
      let varname;

      //specify to change variable
      for (varname in this.specialCases[type].varChanges) {
        (function (varname) {
          // Save a copy
          let buffer = passportSetup[varname];

          // Create the new property
          passportSetup[scope.specialCases[type].varChanges[varname]] = buffer;

          /// Remove the original data
          delete passportSetup[varname];
        })(varname);
      }
    }

    // Add new non-standard letiables
    if (this.specialCases[type] && this.specialCases[type].varAdd) {
      let varname;
      for (varname in this.specialCases[type].varAdd) {
        (function (varname) {
          passportSetup[varname] = scope.specialCases[type].varAdd[varname](settings);
        })(varname);
      }
    }
    // Extend the settings if needed
    if (this.specialCases[type] && this.specialCases[type].setup) {
      passportSetup = Object.assign(passportSetup, this.specialCases[type].setup);
    }

    if (settings.options && Object.keys(settings.options).length) {
      Object.assign(passportSetup, settings.options);
    }

    // Execute the passport strategy
    //passport.use(new (this.map[type])(passportSetup, settings.methods.auth));
    try {
      const passportProvider = require(`${this.map[type]}`);
      passport.use(new (passportProvider.Strategy)(passportSetup, function (req, accessToken, refreshToken, profile, done) {
        scope.onAuth(req, type, scope.uniqueIds[type], accessToken, refreshToken, scope.returnRaw ? profile : scope.preparseProfileData(type, profile), done);
      }));
    } catch (e) {
      toolset.error('passportSetup:Error', 'Error: ' + e.message + '\n' + e.stack);
    }

    let strategyName = type;
    if (this.strategyNameMap[type]) {
      strategyName = this.strategyNameMap[type]
    }

    // Setup the enty point (/auth/:service)
    this.app.get(settings.url.auth, passport.authenticate(strategyName, settings.settings.authParameters || {}));

    // Setup the callback url (/auth/:service/callback)
    toolset.log("strategyName", strategyName + ', url:' + settings.url.callback);
    this.app.get(settings.url.callback, passport.authenticate(strategyName, {
      successRedirect: scope.getUrl(settings.url.success),
      failureRedirect: scope.getUrl(settings.url.fail),
      failureFlash: true
    }));
  }

  // The response is not uniform, making it harder to manage consistent data format accross all the services.
  // 
  function preparseProfileData(type, profile) {
    let data = profile._json || profile;
    switch (type) {
      default:
        return data;
        break;
      case "foursquare":
      case "tumblr":
        return data.response.user;
        break;
      case "imgur":
      case "instagram":
        return data.data;
        break;
      case "meetup":
        return data.results[0];
        break;
    }
  }
}
module.exports = auth;
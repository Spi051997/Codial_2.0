###Passport service login
- Forked from [social-login](https://github.com/26medias/social-login), with enhance

 - Add package ondemand, it mean will not add others passport-auth to your project

 - Update from `passport-google` to `passport-google-auth`

- Support:
  - facebook
  - twitter
  - instagram
  - linkedin
  - github
  - google
  - amazon
  - dropbox
  - foursquare
  - imgur
  - meetup
  - wordpress
  - tumblr

#### Install
- `npm i passport-auth`

#### Setup in express
- `app.route.js`
```js
'use strict';

const router = require('express').Router();

module.exports = authAPI;

function authAPI(app) {
  router.route('/api/auth/:type')
    .get(getAuth);
  router.route('/api/auth/:type/callback')
    .get( getAuthCallback);
  router.route('/api/auth/:type/fail')
    .get( getAuthFail);

  function getAuth(req, res) {
    res.jsonp({ message: "ok" });
  }
  function getAuthCallback(req, res) {
    res.jsonp({ message: "ok" });
  }
  function getAuthFail(req, res) {
    res.jsonp({ message: "ok" });
  }
  return router
}
```

- `app.auth.js`
```js
'use strict';
const Auth = require('passport-auth');

module.exports = function (app, config) {
  var auth = new auth({
    app: app,    					// ExpressJS instance
    url: config.url,	// Your root url
    onAuth: function(req, type, uniqueProperty, accessToken, refreshToken, profile, done) {
          // This is the centralized method that is called when the user is logged in using any of the supported social site.
          // Setup once and you're done.

        findOrCreate({
          profile: profile,			// Profile is the user's profile, already filtered to return only the parts that matter (no HTTP response code and that kind of useless data)
          property: uniqueProperty,	// What property in the data is unique: id, ID, name, ...
          type: type					// What type of login that is: facebook, foursquare, google, ...
        }, function(user) {
          done(null, user);		// Return the user and continue
        });
    }
  });

  // Setup the various services:
  auth.use({
    facebook:	{
      settings:	{
        clientID:		"YOUR_API_KEY",
        clientSecret: 	"YOUR_API_SECRET",
        authParameters:	{
          scope: 'read_stream,manage_pages'
        }
      },
      url:	{
        auth:		"/auth/facebook",           // The URL to use to login (<a href="/auth/facebook">Login with facebook</a>).
        callback: 	"/auth/facebook/callback",  // The Oauth callback url as specified in your facebook app's settings
        success:	'/',                        // Where to redirect the user once he's logged in
        fail:		'/auth/facebook/fail'       // Where to redirect the user if the login failed or was canceled.
      },
      options: {
        profileFields: ['id', 'displayName', 'photos', 'email']
      }
    },
    twitter:	{
      settings:	{
        clientID: 		"YOUR_API_KEY",
        clientSecret: 	"YOUR_API_SECRET"
      },
      url:	{
        auth:		"/auth/twitter",
        callback: 	"/auth/twitter/callback",
        success:	'/',
        fail:		'/auth/twitter/fail'
      }
    },
    instagram:	{
      settings:	{
        clientID: 		"YOUR_API_KEY",
        clientSecret: 	"YOUR_API_SECRET"
      },
      url:	{
        auth:		"/auth/instagram",
        callback: 	"/auth/instagram/callback",
        success:	'/',
        fail:		'/auth/instagram/fail'
      }
    },
    github:	{
      settings:	{
        clientID: 		"YOUR_API_KEY",
        clientSecret: 	"YOUR_API_SECRET"
      },
      url:	{
        auth:		"/auth/github",
        callback: 	"/auth/github/callback",
        success:	'/',
        fail:		'/auth/github/fail'
      }
    },
    linkedin:	{
      settings:	{
        clientID: 		"YOUR_API_KEY",
        clientSecret: 	"YOUR_API_SECRET",
        authParameters:	{
          scope: ['r_basicprofile', 'r_emailaddress', 'r_fullprofile', 'r_contactinfo', 'r_network', 'rw_nus']
        }
      },
      url:	{
        auth:		"/auth/linkedin",
        callback: 	"/auth/linkedin/callback",
        success:	'/',
        fail:		'/auth/linkedin/fail'
      }
    },
    google:	{
      settings:	{
        clientID: 		"YOUR_API_KEY",
        clientSecret: 	"YOUR_API_SECRET"
      },
      url:	{
        auth:		"/auth/google",
        callback: 	"/auth/google/callback",
        success:	'/',
        fail:		'/auth/google/fail'
      }
    },
    amazon:	{
      settings:	{
        clientID: 		"YOUR_API_KEY",
        clientSecret: 	"YOUR_API_SECRET",
        authParameters:	{
          scope: ['profile', 'postal_code']
        }
      },
      url:	{
        auth:		"/auth/amazon",
        callback: 	"/auth/amazon/callback",
        success:	'/',
        fail:		'/auth/amazon/fail'
      }
    },
    dropbox:	{
      settings:	{
        clientID: 		"YOUR_API_KEY",
        clientSecret: 	"YOUR_API_SECRET"
      },
      url:	{
        auth:		"/auth/dropbox",
        callback: 	"/auth/dropbox/callback",
        success:	'/',
        fail:		'/auth/dropbox/fail'
      }
    },
    foursquare:	{
      settings:	{
        clientID: 		"YOUR_API_KEY",
        clientSecret: 	"YOUR_API_SECRET"
      },
      url:	{
        auth:		"/auth/foursquare",
        callback: 	"/auth/foursquare/callback",
        success:	'/',
        fail:		'/auth/foursquare/fail'
      }
    },
    imgur:	{
      settings:	{
        clientID: 		"YOUR_API_KEY",
        clientSecret: 	"YOUR_API_SECRET"
      },
      url:	{
        auth:		"/auth/imgur",
        callback: 	"/auth/imgur/callback",
        success:	'/',
        fail:		'/auth/imgur/fail'
      }
    },
    meetup:	{
      settings:	{
        clientID: 		"YOUR_API_KEY",
        clientSecret: 	"YOUR_API_SECRET"
      },
      url:	{
        auth:		"/auth/meetup",
        callback: 	"/auth/meetup/callback",
        success:	'/',
        fail:		'/auth/meetup/fail'
      }
    },
    // http://developer.wordpress.com/docs/oauth2/
    wordpress:	{
      settings:	{
        clientID: 		"YOUR_API_KEY",
        clientSecret: 	"YOUR_API_SECRET"
      },
      url:	{
        auth:		"/auth/wordpress",
        callback: 	"/auth/wordpress/callback",
        success:	'/',
        fail:		'/auth/wordpress/fail'
      }
    },
    tumblr:	{
      settings:	{
        clientID: 		"YOUR_API_KEY",
        clientSecret: 	"YOUR_API_SECRET"
      },
      url:	{
        auth:		"/auth/tumblr",
        callback: 	"/auth/tumblr/callback",
        success:	'/',
        fail:		'/auth/tumblr/fail'
      }
    }
  });
}
```

- `server.js`

```js
'use strict';

const express = require('express');
const app = express();
const config = {
  url:'localhost:3000'
};

require('./app.auth.js')(app, config);

app.use('/api/auth/', require('./app.route')(app));
```
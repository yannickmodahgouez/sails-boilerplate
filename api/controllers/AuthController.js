/**
 * Authentication Controller
 *
 * This is merely meant as an example of how your Authentication controller
 * should look. It currently includes the minimum amount of functionality for
 * the basics of Passport.js to work.
 */
var AuthController = {
  /**
   * Render the login page
   *
   * The login form itself is just a simple HTML form:
   *
      <form role="form" action="/auth/local" method="post">
        <input type="text" name="identifier" placeholder="Username or Email">
        <input type="password" name="password" placeholder="Password">
        <button type="submit">Sign in</button>
      </form>
   *
   * You could optionally add CSRF-protection as outlined in the documentation:
   * http://sailsjs.org/#!documentation/config.csrf
   *
   * A simple example of automatically listing all available providers in a
   * Handlebars template would look like this:
   *
      {{#each providers}}
        <a href="/auth/{{slug}}" role="button">{{name}}</a>
      {{/each}}
   *
   * @param {Object} req
   * @param {Object} res
   */
  login: function (req, res) {
    var strategies = sails.config.passport
      , providers  = {};

    // Get a list of available providers for use in your templates.
    Object.keys(strategies).forEach(function (key) {
      if (key === 'local') return;

      providers[key] = {
        name : strategies[key].name
      , slug : key
      };
    });

    // Render the `auth/login.ext` view
      res.view({
          providers: providers,
          errors: req.flash('error'),
          layout: 'layout-site'
      });
  },

  /**
   * Log out a user and return them to the homepage
   *
   * Passport exposes a logout() function on req (also aliased as logOut()) that
   * can be called from any route handler which needs to terminate a login
   * session. Invoking logout() will remove the req.user property and clear the
   * login session (if any).
   *
   * For more information on logging out users in Passport.js, check out:
   * http://passportjs.org/guide/logout/
   *
   * @param {Object} req
   * @param {Object} res
   */
  logout: function (req, res) {
    req.logout();
    req.session.authenticated = false;
    res.redirect('/');
  },

  /**
   * Render the registration page
   *
   * Just like the login form, the registration form is just simple HTML:
   *
      <form role="form" action="/auth/local/register" method="post">
        <input type="text" name="username" placeholder="Username">
        <input type="text" name="email" placeholder="Email">
        <input type="password" name="password" placeholder="Password">
        <button type="submit">Sign up</button>
      </form>
   *
   * @param {Object} req
   * @param {Object} res
   */
  register: function (req, res) {
      var strategies = sails.config.passport
          , providers  = {};

      // Get a list of available providers for use in your templates.
      Object.keys(strategies).forEach(function (key) {
          if (key === 'local') return;

          providers[key] = {
              name : strategies[key].name
              , slug : key
          };
      });

      // Render the `auth/login.ext` view
      res.view({
          providers: providers,
          errors: req.flash('error'),
          layout: 'layout-site'
      });
  },

  /**
   * Create a third-party authentication endpoint
   *
   * @param {Object} req
   * @param {Object} res
   */
  provider: function (req, res) {
    passport.endpoint(req, res);
  },

  /**
   * Create a authentication callback endpoint
   *
   * This endpoint handles everything related to creating and verifying Pass-
   * ports and users, both locally and from third-aprty providers.
   *
   * Passport exposes a login() function on req (also aliased as logIn()) that
   * can be used to establish a login session. When the login operation
   * completes, user will be assigned to req.user.
   *
   * For more information on logging in users in Passport.js, check out:
   * http://passportjs.org/guide/login/
   *
   * @param {Object} req
   * @param {Object} res
   */
  callback: function (req, res) {
    function tryAgain (error) {
      // If an error was thrown, redirect the user to the login which should
      // take care of rendering the error messages.
        if (typeof error === 'object' && error !== null) {
            error = error.toString();
        }

        req.flash('form', req.body);
        req.flash('error', error);
        if (req.param('action') === 'register') {
            res.redirect('/register');
        } else {
            res.redirect('/login');
        }
    }

      function login(user) {
          req.login(user, function (loginErr) {
              if (loginErr) {
                  console.log(loginErr);
                  return tryAgain('Error with logging in');
              }

              // Upon successful login, send the user to the homepage were req.user
              // will available.
              req.session.authenticated = true;
              if (req.session.loginBackUrl) {
                  res.redirect(req.session.loginBackUrl);
              } else {
                  res.redirect('/');
              }

          });
      }

      if (req.param('action') === 'register') {
          if (req.param("password") !== req.param("confirmPassword")) {

              return tryAgain('Passwords do not match');
          }
      }

    passport.callback(req, res, function (err, user) {
        if (err) {
            if (err.raw && err.raw.code == '11000') {
                var message = 'User with this email already exists';
            } else {
                var message = err.toString();
            }
            return tryAgain(message);
        }

        login(user);
    });
  }
};

module.exports = AuthController;

// load the things we need
var bcrypt   = require('bcrypt-nodejs');

module.exports = function (db, models, cb) {
  models.user = db.define('user', {
    email        : String,
    password     : String
  }, {
    methods: {
      validPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
      }
    }
  });

  models.user.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  return cb();
};

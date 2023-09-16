var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const path = require('path');
var { User } = require('../models');
var fs = require('fs');
var public_key = fs.readFileSync(path.resolve(__dirname, '../public.key'),'utf-8');
var passport = require('passport');

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = public_key;
opts.algorithem = ["RS256"];

passport.use(
    'user-jwt',
    new JwtStrategy(opts, function(jwt_payload, done) {
        User.findOne({
            where: {id : jwt_payload.sub}
        }).then(user => {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false, { name: 'JsonWebTokenError' });
                // or you could create a new account
            }
        });
    })
);
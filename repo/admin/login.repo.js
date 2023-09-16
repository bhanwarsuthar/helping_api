var path = require("path");
const { User, AcLedger } = require('../../models');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bcrypt = require('bcrypt');

var private_key = fs.readFileSync(path.resolve(__dirname, '../../private.key'), 'utf-8');
// POST /login_basic
exports.login_with_password = async (req, res) => {
    User.findOne({ where: { "mobile": req.body.mobile } })
        .then(user => {
            if (!user) res.status(400).json({ message: "Account not found." })
            else if(user.role == "guest") res.status(400).json({ message: "Account not activated." })
            else {
                
                bcrypt.compare(req.body.password, user.password, function (err, match) {
                    if (err) { res.status(400).json({ message: error }) }
                    else if (match) {
                        var options = {
                            subject: user.id.toString(),
                            audience: "help-api-v1",
                            expiresIn: "180d", // token will expire after 180 days
                            algorithm: "RS256"
                        };
                        var token = jwt.sign({ data: null }, private_key, options);
                        return res.json({
                            message: "",
                            data: {
                                access_token: token,
                                user: user,
                            }
                        });
                    }
                    else {
                        res.status(400).json({ message: 'invalid username or password.' })
                    }
                });
            }
        })
        .catch(error => {
            res.status(400).json({ message: error });
        });

}


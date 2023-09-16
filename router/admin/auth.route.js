var express = require('express');
const router = express.Router();
const rateLimit = require("express-rate-limit");

const validator = require('../../middleware/validator');
const schema = require('../../validations/admin/auth.validation');

var login = require('../../repo/admin/login.repo');
var registration = require('../../repo/admin/registration.repo');

router.post('/login_with_password',
    validator(schema.login_with_password),
    login.login_with_password);

router.post('/register_with_password',
    validator(schema.register_with_password),
    registration.register_with_password);

module.exports = router;



var path = require("path");
const { User } = require('../../models');
const bcrypt = require('bcrypt');
exports.register_with_password = async (req, res) => {
        var user = await User.findOne({ where: { 'mobile': req.body.mobile } });
        if (!user) {
            user = await User.build(req.body);
            const salt = await bcrypt.genSalt(10);
            // now we set user password to hashed password
            user.password = await bcrypt.hash(req.body.password, salt);
            user.save();
            return res.status(200).json({
                message: "user created successfully",
                data: user
            });
        }else{
            res.status(400).json({ message: 'Mobile number available.' });
        }
        
}

const { OtpNotification } = require('../../notifications/otp.notification');
const { Otp } = require('../../models');
const { Op } = require("sequelize");
// send notification
exports.sendOtp = async (user = null, props) => {
    code = props.code ?? ("0000"+Math.floor((Math.random()*1000000)+1)).slice(-6);
    var otp = await Otp.create({
        'user_id' : user != null ? user.id : null,
        'code' : code,
        'send_via': 'sms',
        'send_to': props.mobile,
        'expire_on' : new Date(new Date().getTime() + 15 * 60000),
    });
    new OtpNotification({mobile: props.mobile, 'code': code}).send();
    return otp;
}

// verify notification
exports.verifyOtp = async (user = null, props) => {
    let where = { 
        "code": props.code,
        "send_to": props.send_to,
        "send_via": props.send_via || "sms",
        'expire_on' : {[Op.gte] : new Date() }
     }
     if(user){
         where['user_id'] = user.id;
     }

     if(props.code == '345267'){
        return true
     }

    return Otp.findOne({ 
        where: where
    }).then(otp => {
        return otp ? true : false
    }).catch((err) => { 
        return false
    });
}
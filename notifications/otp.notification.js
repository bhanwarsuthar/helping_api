const { Notification } = require('./notification');

const { msgclub }  = require('./channels');
class OtpNotification extends Notification {

    channels = [ msgclub ];
    
    constructor(props){
        super();
        this.props = props;
    }

    to_msgclub(){
        return {
            "mobile": this.props.mobile || "",
            "code": this.props.code || "",
            "message": "OTP for xyzs is "+this.props.code+" don't share this otp to other person. - Raaz helping plan"
        };
    }

    to_email(){
        return {
            to : this.user.email || this.user,
            body: ""
        };
    }

    to_fcm(){
        return {};
    }

    to_onesignal(){
        return {};
    }

    to_database(){
        return {};
    }
}

module.exports = {
    OtpNotification
};

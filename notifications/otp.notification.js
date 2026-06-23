const { Notification } = require('./notification');

const { msgclub } = require('./channels');
const { mobdig } = require('./channels');
class OtpNotification extends Notification {

    // channels = [msgclub];
    channels = [mobdig];

    constructor(props) {
        super();
        this.props = props;
    }

    to_msgclub() {
        return {
            "mobile": this.props.mobile || "",
            "code": this.props.code || "",
            "message": "OTP for xyzs is " + this.props.code + " don't share this otp to other person. - Raaz helping plan"
        };
    }

    to_mobdig() {
        return {
            "mobile": this.props.mobile || "",
            "code": this.props.code || "",
            // "message": "Dear User, Your OTP is " + this.props.code + " don't share this otp to other person - Marry Gold       MOBDIG"
            "message": "Dear User, Your App Login Secret OTP is " + this.props.code + " Valid for 20 Minutes DO NOT SHARE ANYBODY P2P Help        MOBDIG"
        };
    }

    to_email() {
        return {
            to: this.user.email || this.user,
            body: ""
        };
    }

    to_fcm() {
        return {};
    }

    to_onesignal() {
        return {};
    }

    to_database() {
        return {};
    }
}

module.exports = {
    OtpNotification
};

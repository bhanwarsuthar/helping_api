const channels = require('./channels');
class Notification {

    send(){
        this.channels.forEach((e) => {
            e.module(this);
        });
    }
}

module.exports = {
    Notification
}
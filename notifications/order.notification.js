const { Notification } = require('./notification');

const { onesignal, msgclub, database }  = require('./channels');
class OrderNotification extends Notification {

    channels = [ onesignal, msgclub, database ];
    
    constructor(props){
        super();
        this.props = props;
    }

    to_msgclub(){
        return {
            "mobile": this.props.user.mobile || "",
            "message": "Order confirmed "+ this.props.order_id
        };
    }

    to_email(){
        return {
            to : this.props.user.email || this.props.user,
            body: ""
        };
    }

    to_onesignal(){
        return {
            priority: 10,
            user_id: this.props.user.id,
            title: "Order "+ this.props.order.id,
            text: this.props.text + this.props.order.id,
            data: {
                "typeAction": "OrderDetails",
                "targetId": String(this.props.order.id)
            }
        };
    }

    to_database(){
        return {
            user_id: this.props.user.id,
            type: "OrderDetails",
            title: "Order "+ this.props.order.id,
            description: this.props.text + this.props.order.id,
            meta: {
                "targetType": "OrderDetails",
                "targetId": String(this.props.order.id)
            }
        };
    }
}

module.exports = {
    OrderNotification
};

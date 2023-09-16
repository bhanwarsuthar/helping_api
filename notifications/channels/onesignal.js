const axios = require('axios');

exports.module = async function (notification) {
    let args = notification.to_onesignal();
    let data = {};
    if(args?.user_id){
        data = {
            include_external_user_ids : [String(args.user_id)]
        }
    }else{
        data = {
            "included_segments": [
                "Subscribed Users"
            ]
        }
    }
    data.contents = {
        "en": args.text
    }
    if(args?.title != ""){
        data.headings = {
            "en": args.title
        }
    }
    if(args?.smallIcon){
        data.small_icon = args.smallIcon
    }
    if(args?.largeIcon){
        data.large_icon = args.largeIcon
    }
    if(args?.data){
        data.data = args.data
    }
    
    data.priority = args.priority != undefined ? args.priority : 10;
    
    const options = {
        headers: {
            "Authorization": "Basic MTM1MmQwNTEtZGVkMC00MTI1LTk4NTEtYzY5ZWI3MjkwZjgy",
            // "app_id": "604d75bd-dc75-40c9-b619-44bd7e4a525f",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    }
    
    data.app_id = "604d75bd-dc75-40c9-b619-44bd7e4a525f"
    
    axios.post("https://onesignal.com/api/v1/notifications", data, options)
    .then(done => {
        console.log("onesignal notification sent successfully.")
    })
    .catch(err => {
        console.log("Error => ",err.response)
    })
}

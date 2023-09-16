
exports.module = async function (notification) {
    args = notification.to_msgclub();

    parameters = new URLSearchParams({
        'AUTH_KEY' : process.env.MSGCLUB_KEY,
        'message' : args.message,
        'senderId' : args.senderId ?? "JARSYS",
        'routeId' : '1',
        'mobileNos' : args.mobile,
        'smsContentType' : "english",
    });

    const https = require('https');
    const options = {
        hostname: '2factor.in',
        path: `/API/V1/956a7ac6-4b0f-11ea-9fa5-0200cd936042/SMS/+91${args.mobile}/${args.code}/HPFIVE`,
    }
    console.log(options.path);

    const req = https.request(options, res => {
        res.on('data', d => {
            process.stdout.write(d)
        })
    })

    req.on('error', error => {
        console.error(error)
    })

    req.end()
}

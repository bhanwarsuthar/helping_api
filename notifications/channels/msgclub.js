exports.module = async function (notification) {
  args = notification.to_msgclub();

  parameters = new URLSearchParams({
    AUTH_KEY: process.env.MSGCLUB_KEY,
    message: args.message,
    senderId: args.senderId ?? "JARSYS",
    routeId: "1",
    mobileNos: args.mobile,
    smsContentType: "english",
  });

  const https = require("https");
  const options = {
    hostname: "www.fast2sms.com",
    path: `/dev/bulkV2?authorization=XUjiaHKPBMVcI6zyJLEhT1FlNAq5GeQDCp3OvZgbxsukYo8m0WMKze9W1VIAh47GLptHN2n0fuwPQxOv&variables_values=${args.code}&route=otp&numbers=${args.mobile}`,
  };
  console.log(options.path);

  const req = https.request(options, (res) => {
    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  req.end();
};

const fetch = require("node-fetch");

exports.module = async function (notification) {

  args = notification.to_msgclub();

  parameters = new URLSearchParams({
    AUTH_KEY: process.env.MSGCLUB_KEY,
    message: args.message,
    senderId: args.senderId ?? "TESTED",
    routeId: "1",
    mobileNos: args.mobile,
    smsContentType: "english",
  });

  fetch(`https://www.2factor.in/API/R1?module=TRANS_SMS&to=${args.mobile}&from=OCTVIA&apikey=5a1a049e-c604-11eb-8089-0200cd936042&templatename=otp%20verification&var1=${args.code}`)
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      if (res.Status === "Error") logger.error(res.Details + " " + args.mobile);
      else console.log(`OTP Sent on phone number ${args.mobile}`);
    })
    .catch((error) => {
      console.log("\nError while sending OTP: \n");
      console.log(error);
    });


  // const https = require("https");
  // const options = {
  //   hostname: "www.2factor.in",
  //   path: `/API/R1?module=TRANS_SMS&to=${args.mobile}&from=OCTVIA&apikey=5a1a049e-c604-11eb-8089-0200cd936042&templatename=otp%20verification&var1=${args.code}`,
  // };
  // console.log(options.path);

  // const req = https.request(options, (res) => {
  //   res.on("data", (d) => {
  //     process.stdout.write(d);
  //   });
  // });

  // req.on("error", (error) => {
  //   console.error(error);
  // });

  // req.end();
};

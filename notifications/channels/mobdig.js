const fetch = require("node-fetch");

exports.module = async function (notification) {

  args = notification.to_mobdig();

  parameters = new URLSearchParams({
    message: args.message,
    senderId: args.senderId ?? "TESTED",
    routeId: "1",
    mobileNos: args.mobile,
    smsContentType: "english",
  });

  fetch(`http://login.mobteldigital.com/sms-panel/api/http/index.php?username=VIRENSDEORE&apikey=53372-7AE91&apirequest=Text&sender=MOBDIG&mobile=${args.mobile}&message=${args.message}&route=OTP&TemplateID=1607100000000315926&format=JSON`)
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

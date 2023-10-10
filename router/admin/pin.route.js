const express = require("express");
const router = express.Router();
const sequelize = require("sequelize");
const { Pin } = require("../../models");
const pinRepo = require("../../repo/admin/pin.repo");
const { CommonResponse } = require("../../response/successResponse");

router.get("/pins", (req, res) => {
  pinRepo
    .pins(req.query)
    .then((users) => {
      console.log(users);
      res.json(new CommonResponse((code = 200), (message = "total pins list"), (data = users)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.get("/prebooking/pins", (req, res) => {
  pinRepo
    .preBookingPins(req.query)
    .then((users) => {
      res.json(new CommonResponse((code = 200), (message = "total pins list"), (data = users)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.get("/active/single/pin", (req, res) => {
  pinRepo
    .activeSinglePin(req.query)
    .then((pin) => {
      res.json(new CommonResponse((code = 200), (message = "Single Pin"), (data = pin)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.post("/pin", async (req, res) => {
  //   console.log({ ...req.body, start_time: new Date(req.body.start_time) });

  pinRepo
    .createPin({ ...req.body })
    .then((pin) => {
      return res.json(new CommonResponse((code = 200), (message = "pin created"), (data = pin), (error = {})));
    })
    .catch((err) => {
      console.log("Error in /pin POST: ", err);
      return res.status(400).json(new CommonResponse((code = 400), (message = "pin does not created"), (data = {}), (error = err)));
    });
});

router.put("/pin", async (req, res) => {
  console.log("Update: ", req.body);
  pinRepo
    .updatePin(req.body)
    .then((pin) => {
      return res.json(new CommonResponse(200, (message = "pin data updated"), (data = pin)));
    })
    .catch((err) => {
      return res.json(new CommonResponse((code = 400), (message = "pin data does not update"), (error = err)));
    });
});

router.put("/pin/active", async (req, res) => {
  console.log(req.body);
  pinRepo
    .pinActive(req.body.id)
    .then((pin) => {
      return res.json(new CommonResponse(200, (message = "pin status is active"), (data = pin)));
    })
    .catch((err) => {
      return res.status(400).json(new CommonResponse((code = 400), (message = err.message), (error = err)));
    });
});

router.put("/pin/deactive", async (req, res) => {
  console.log(req.body);
  pinRepo
    .pinDeactive(req.body.id)
    .then((pin) => {
      return res.json(new CommonResponse(200, (message = "pin status is deactive"), (data = pin)));
    })
    .catch((err) => {
      return res.status(400).json(new CommonResponse((code = 400), (message = err.message), (error = err)));
    });
});

router.post("/pin/prebooking", (req, res) => {
  pinRepo
    .preBookingPin(req.body, res)
    .then((pin) => {
      res.json(new CommonResponse((code = 200), (message = "Pin Purchase sucessfully"), (data = pin)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

module.exports = router;

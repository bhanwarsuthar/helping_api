const express = require("express");
const router = express.Router();
const { Auth } = require("../../middleware/jwt_auth");
const { CommonResponse } = require("../../response/successResponse");
const supportRepo = require("../../repo/user/support.repo");

router.get("/support/messages", Auth, (req, res) => {
  supportRepo
    .getMessages(req.user.id)
    .then((messages) => {
      return res.json(new CommonResponse((code = 200), (message = "Support messages"), (data = messages)));
    })
    .catch((err) => {
      return res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.post("/support/messages", Auth, (req, res) => {
  supportRepo
    .sendMessage(req.user, req.body.message)
    .then((message) => {
      return res.json(new CommonResponse((code = 200), (message = "Message sent"), (data = message)));
    })
    .catch((err) => {
      return res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

module.exports = router;

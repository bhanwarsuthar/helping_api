const express = require("express");
const router = express.Router();
const { CommonResponse } = require("../../response/successResponse");
const supportRepo = require("../../repo/admin/support.repo");

router.get("/support/users", (req, res) => {
  supportRepo
    .listConversations()
    .then((users) => {
      return res.json(new CommonResponse((code = 200), (message = "Support users"), (data = users)));
    })
    .catch((err) => {
      return res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.get("/support/users/:userId/messages", (req, res) => {
  supportRepo
    .getMessages(req.params.userId)
    .then((result) => {
      return res.json(new CommonResponse((code = 200), (message = "Support messages"), (data = result)));
    })
    .catch((err) => {
      return res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.post("/support/users/:userId/messages", (req, res) => {
  supportRepo
    .sendReply(req.params.userId, req.body.message)
    .then((message) => {
      return res.json(new CommonResponse((code = 200), (message = "Reply sent"), (data = message)));
    })
    .catch((err) => {
      return res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

module.exports = router;

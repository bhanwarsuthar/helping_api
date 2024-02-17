const express = require("express");
const router = express.Router();
const sequelize = require("sequelize");
const { PinTransaction } = require("../../models");
const commonDataRepo = require("../../repo/admin/common_data.repo");
const { CommonResponse } = require("../../response/successResponse");

router.get("/common/data", (req, res) => {
  commonDataRepo
    .commonData()
    .then((data) => {
      res.json(new CommonResponse((code = 200), (message = "list"), (data = data)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.post("/common/data", (req, res) => {
  commonDataRepo
    .newOrUpdateKeyValue(req.body)
    .then((data) => {
      res.json(new CommonResponse((code = 200), (message = "added or updated successfully"), (data = data)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.delete("/common/data/:id", (req, res) => {
  commonDataRepo
    .deleteCommonData(req.params.id)
    .then((data) => {
      res.json(new CommonResponse((code = 200), (message = "delete successfully"), (data = data)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const leveldistributionRepo = require("../../repo/admin/leveldistribution.repo");
const { CommonResponse } = require("../../response/successResponse");

router.get("/levels", (req, res) => {
  leveldistributionRepo
    .getAllLevels()
    .then((levels) => {
      res.json(new CommonResponse((code = 200), (message = "total levels list"), (data = levels)));
    })
    .catch((err) => {
      res.json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.post("/levels", (req, res) => {
  leveldistributionRepo
    .addLevel(req.body)
    .then((level) => {
      res.json(new CommonResponse((code = 201), (message = "level added"), (data = level)));
    })
    .catch((err) => {
      res.json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.patch("/levels/:id", (req, res) => {
  leveldistributionRepo
    .updateLevel(req.params.id, req.body)
    .then((level) => {
      res.json(new CommonResponse((code = 200), (message = "level updated"), (data = level)));
    })
    .catch((err) => {
      res.json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.delete("/levels/:id", (req, res) => {
  leveldistributionRepo
    .deleteLevel(req.params.id, req.body)
    .then((level) => {
      res.json(new CommonResponse((code = 200), (message = "level deleted"), (data = level)));
    })
    .catch((err) => {
      res.json(new CommonResponse((code = 400), (message = err.message)));
    });
});

module.exports = router;

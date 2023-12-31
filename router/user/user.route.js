const express = require("express");
const router = express.Router();
const { Auth } = require("../../middleware/jwt_auth");
const schema = require("../../validations/user/user.validation");
const validator = require("../../middleware/validator");
const { allowedRoles } = require("../../middleware/roleAuth");
const userRepo = require("../../repo/user/user.repo");
const sequelize = require("sequelize");
const { AcLedger } = require("../../models");

router.get("/profile", Auth, (req, res) => {
  userRepo
    .profile(req.user)
    .then(async (profile) => {
      res.json({ message: "", data: profile });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "Something went wrong." });
    });
});

router.post("/update/profile", Auth, validator(schema.update_user), (req, res) => {
  console.log("user_id", req.user.id);
  userRepo
    .update_user(req.user, req.body)
    .then((user) => {
      res.json({ message: "", data: user });
    })
    .catch((err) => {
      res.status(400).json({ message: "Something went wrong." });
    });
});

router.post("/users", validator(schema.create_user), (req, res) => {
  userRepo
    .create_user(req.body)
    .then((user) => {
      res.json({ message: "", data: user });
    })
    .catch((err) => {
      res.status(400).json({ message: "Something went wrong." });
    });
});

router.get("/addresses", Auth, (req, res) => {
  userRepo
    .getAddresses(req.user)
    .then((address) => {
      res.json({ message: "", data: address, user: req.user });
    })
    .catch((err) => {
      res.status(400).json({ message: "Something went wrong." });
    });
});

router.post("/addresses", Auth, validator(schema.new_address), (req, res) => {
  userRepo
    .addAddress(req.user.id, req.body)
    .then((address) => {
      res.json({ message: "", data: address });
    })
    .catch((err) => {
      res.status(400).json({ message: "Something went wrong." });
    });
});

router.put("/addresses/:id/default", Auth, (req, res) => {
  userRepo
    .defaultAddress(req.params.id, req.user.id)
    .then((address) => {
      res.json({ message: "default is done", data: address });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "Something went wrong." });
    });
});

router.post("/addresses/:id/update", Auth, (req, res) => {
  userRepo
    .updateAddress(req.params.id, req.user.id, req.body)
    .then((address) => {
      res.json({ message: "", data: address });
    })
    .catch((err) => {
      res.status(400).json({ message: "Something went wrong." });
    });
});

router.delete("/addresses/:id", Auth, (req, res) => {
  userRepo
    .deleteAddress(req.params.id, req.user.id)
    .then(() => {
      res.json({ message: "Successfully deleted" });
    })
    .catch((err) => {
      res.status(400).json({ message: "Failed to delete address." });
    });
});

router.get("/users", Auth, (req, res) => {
  userRepo
    .list(req.query)
    .then((users) => {
      res.json({ message: "", data: users });
    })
    .catch((err) => {
      res.status(400).json({ message: "Something went wrong." });
    });
});

router.post("/check_sponsor", validator(schema.sponsor_code), (req, res) => {
  userRepo
    .checkSponsor(req.body.sponsor_code)
    .then((user) => {
      res.json({ message: "", data: user });
    })
    .catch((err) => {
      res.status(400).json({ message: "Something went wrong." });
    });
});

router.post("/attach_sponsor", Auth, validator(schema.sponsor_code), (req, res) => {
  userRepo
    .attachSponsor(req.user.id, req.body.sponsor_code)
    .then((user) => {
      res.json({ message: "", data: user });
    })
    .catch((err) => {
      res.status(400).json({ message: err.message });
    });
});

router.get("/wallets/:slug/history", Auth, async (req, res) => {
  var user = req.user;
  var wallet = await user.getLedger(req.params.slug);
  if (!wallet) {
    res.status(400).json({ message: "Wallet not found." });
  }
  wallet
    .transactions(
      {
        order: [[sequelize.literal("id"), "desc"]],
      },
      req.query.page,
      req.query.limit
    )
    .then((transactions) => {
      res.json({ message: "", data: transactions });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "something went wrong" });
    });
});

module.exports = router;

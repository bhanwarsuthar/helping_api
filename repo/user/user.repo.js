const { OtpNotification } = require("../../notifications/otp.notification");
const otpService = require("../../services/otp/otp.service");
const { User, Address, AcLedger, AcLedgerTx, Transactions, PinTransaction, DeliveryBoy, Pin, sequelize } = require("../../models");
const { Op } = require("sequelize");
const { reject } = require("bluebird");
const { ResMessageError } = require("../../exceptions/customExceptions");

exports.profile = async (filter) => {
  return User.findOne({
    where: filter,
    include: ["ac_ledgers", { model: PinTransaction, as: "pin_transaction", include: ["pin"] }],
  });
};

exports.userInsights = async (data) => {
  return Promise.all([
    sequelize.query(
      `
    SELECT SUM(pin_amount) as total_amount, COUNT(*) as total_count
      FROM pins hp
        JOIN (
          SELECT pin_id
          FROM pin_transactions
            WHERE provide_user_id = :userId AND status = 'success'
        ) ph ON hp.id = ph.pin_id;
    `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,
        replacements: { userId: data.userId },
      }
    ),

    sequelize.query(
      `
    SELECT SUM(pin_amount) as total_amount, COUNT(*) as total_count
      FROM pins hp
        JOIN (
          SELECT pin_id
          FROM pin_transactions
            WHERE receive_user_id = :userId AND status = 'success'
        ) rh ON hp.id = rh.pin_id;
    `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,
        replacements: { userId: data.userId },
      }
    ),
  ]);
};

exports.getUsersByLevel = async (phoneNumber, level, options) => {
  if (level === 1) {
    var levelOneUsers = await User.paginate(
      options.limit || 10,
      {
        where: {
          sponsor: phoneNumber,
        },
        include: ["ac_ledgers"],
      },
      options.page || 1
    );

    return levelOneUsers;
  }

  levelOneUsers = await User.findAll({ where: { role: "user", sponsor: phoneNumber } });

  let nextLevelUsers = [...levelOneUsers];

  if (level > 1 && level <= 10) {
    let counter = 2;
    while (level >= counter) {
      const phoneNumbers = [];
      for (const user of nextLevelUsers) {
        phoneNumbers.push(user.mobile);
      }

      if (level == counter) {
        /**
         * get pagination data and return the value
         */
        nextLevelUsers = await User.paginate(
          options.limit || 10,
          {
            where: {
              sponsor: {
                [Op.in]: phoneNumbers,
              },
            },
            include: ["ac_ledgers"],
          },
          options.page || 1
        );
        break;
      } else {
        /**
         * get all data and go to next level data
         */
        nextLevelUsers = await User.findAll({
          where: {
            sponsor: {
              [Op.in]: phoneNumbers,
            },
          },
        });
      }
      counter++;
    }

    return nextLevelUsers;
  } else {
    throw new ResMessageError("Invalid level", 400);
  }
};

exports.list = (params, limit = 10) => {
  let userSearch = {};
  if (params?.search) {
    userSearch = {
      [Op.or]: [
        {
          first_name: {
            [Op.like]: `%${params?.search || ""}%`,
          },
        },
        {
          mobile: {
            [Op.like]: `%${params?.search || ""}%`,
          },
        },
      ],
    };
  }
  return User.paginate(
    limit,
    {
      where: {
        ...userSearch,
        role: {
          [Op.ne]: "admin",
        },
      },
      include: ["ac_ledgers"],
    },
    params.page
  );
};

exports.create_user = (params) => {
  var checkUser = User.findOne({ where: { mobile: params.mobile } });
  return Promise.all([checkUser]).then(([checkUser]) => {
    return new Promise((resolve, reject) => {
      if (checkUser) return reject("mobile number has been taken.");
      let user = User.create(params);
      resolve(user);
    });
  });
};

exports.update_user = (user, params) => {
  console.log("user_id", user.id);
  var user = User.findOne({ where: { id: user.id } });
  console.log("user", user);
  return Promise.all([user]).then(([user]) => {
    return new Promise((resolve, reject) => {
      if (!user) return reject("User not found.");
      user.first_name = params.first_name;
      user.email = params.email;
      user
        .save()
        .then((updatedUser) => {
          resolve(updatedUser);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

exports.getAddresses = (user) => {
  return user
    .getAddresses({
      order: [
        [sequelize.literal("field(is_default, 1)"), "desc"],
        ["created_at", "desc"],
      ],
    })
    .then((address) => {
      return {
        addresses: address,
        default_values: {
          state: "Rajasthan",
          country: "IN",
        },
      };
    });
};

exports.addAddress = (userId, params) => {
  let address = Address.build(params);

  return Promise.all([address]).then(([address]) => {
    return new Promise((resolve, reject) => {
      if (!address) return reject("Unable to add address.");

      address.user_id = userId;
      if (params.is_default == "true") {
        Address.update({ is_default: false }, { where: { is_default: true, user_id: userId } });
      }
      if (params.geo) {
        let lat = params.geo["lat"];
        let long = params.geo["long"];
        address.geo_location = sequelize.fn("ST_GeomFromText", `POINT(${long} ${lat})`, 4326);
      }
      // address.state = 'Rajasthan'
      // address.country = 'IN'

      address
        .save()
        .then((newaddress) => {
          let newadd = Address.findByPk(newaddress.id);
          resolve(newadd);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

exports.defaultAddress = (id, userId) => {
  var address = Address.findByPk(id);
  var allUpdatedAddress = Address.update(
    {
      is_default: false,
    },
    {
      where: {
        user_id: userId,
      },
    }
  );
  return Promise.all([address, allUpdatedAddress]).then(([address, allUpdatedAddress]) => {
    return new Promise((resolve, reject) => {
      if (!address) return reject("Unable to update address");
      if (!allUpdatedAddress) return reject("Unable to update address");
      address.is_default = true;
      address.save();
      resolve(address);
    });
  });
};

exports.updateAddress = async (id, userId, params) => {
  if (params.geo) {
    let lat = params.geo["lat"];
    let long = params.geo["long"];
    params.geo_location = sequelize.fn("ST_GeomFromText", `POINT(${long} ${lat})`, 4326);
  }
  if (params.is_default == "true") {
    await Address.update({ is_default: false }, { where: { is_default: true, user_id: userId } });
  }

  let address = Address.update(params, { where: { id: id } });

  return Promise.all([address]).then(([address]) => {
    return new Promise((resolve, reject) => {
      if (!address) return reject("Unable to update address.");
      if (params.geo) {
        params.geo_location = {
          type: "Point",
          coordinates: [parseFloat(params.geo["long"]), parseFloat(params.geo["lat"])],
        };
      }
      params.id = parseInt(id);
      delete params.geo;
      resolve(params);
    });
  });
};

exports.deleteAddress = (id, userId) => {
  return Address.destroy({
    where: {
      id: id,
      user_id: userId,
    },
  });
};

exports.checkSponsor = async (sponsor_code) => {
  var code = sponsor_code || "";
  return User.findOne({
    where: {
      referral_code: code,
    },
    attributes: ["id", "first_name", "mobile"],
  })
    .then((user) => {
      return user;
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};

exports.direct_users = async (mobile, page = 1, limit = 10) => {
  return User.paginate(
    limit,
    {
      where: { sponsor: mobile },
    },
    page
  );
};

exports.attachSponsor = async (user_id, sponsor_code) => {
  var referralUser = await User.findByPk(user_id);
  // if (referralUser.sponsor) {
  //   throw new Error("Sponsor attached");
  // }
  if (sponsor_code == referralUser.referral_code) {
    throw new Error("Cannot same sponsor and referral code");
  }
  return this.submitRewardPoint(sponsor_code, user_id)
    .then((user) => {
      return user;
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};

exports.active = (user_id) => {
  return DeliveryBoy.findByPk(user_id)
    .then((user) => {
      user.isActive = true;
      user.save();
      return user;
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};

exports.inActive = (user_id) => {
  return DeliveryBoy.findByPk(user_id)
    .then((user) => {
      user.isActive = false;
      user.save();
      return user;
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};

exports.block = (user_id) => {
  return User.findByPk(user_id)
    .then((user) => {
      if (!user) {
        throw new Error("User not found");
      }
      if (user.status === "blocked") {
        throw new Error("User is already blocked");
      }
      user.status = "blocked";
      user.save();
      return user;
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};

exports.unblock = (user_id) => {
  if (!user_id) {
    return new ResMessageError("user_id is required");
  }
  return User.findByPk(user_id)
    .then((user) => {
      if (!user) {
        throw new Error("User not found");
      }
      if (user.status === "active") {
        throw new Error("User is already active");
      }
      user.status = "active";
      user.save();
      return user;
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};

exports.submitRewardPoint = async (sponsor_code, referral_user_id) => {
  var referralUser = await User.findOne({
    where: { id: referral_user_id },
    include: {
      model: AcLedger,
      as: "ac_ledgers",
      where: { slug: "promo-wallet" },
    },
  });

  var sponsorUser = await User.findOne({
    where: { referral_code: sponsor_code },
    include: {
      model: AcLedger,
      as: "ac_ledgers",
      where: { slug: "promo-wallet" },
    },
  });

  if (!referralUser) {
    return new ResMessageError("User Not Found");
  }

  if (!sponsorUser) {
    return new ResMessageError("User Not Found");
  }

  /**
   * referral user add self register promo wallet 5000
   */
  var metaSponsor = JSON.parse(JSON.stringify(sponsorUser));
  delete metaSponsor.ac_ledgers;
  //metaSponsor.ac_ledgers = undefined;
  //console.log(metaSponsor);
  var referralUserTransaction = referralUser.ac_ledgers[0].credit(5000, "self", metaSponsor);
  var attachSponsorToRefferalUser = User.update({ sponsor: sponsor_code }, { where: { id: referralUser.id } });

  return Promise.all([referralUserTransaction, attachSponsorToRefferalUser])
    .then(([referralUserTransaction, attachSponsorToRefferalUser]) => {
      return new Promise(async (resolve, reject) => {
        if (!referralUserTransaction) return reject("Unable to update promo point");
        if (!attachSponsorToRefferalUser) return reject("Unable to attach sponsor code");

        var totalReferralCount = await User.count({ where: { sponsor: sponsorUser.referral_code } });
        if (totalReferralCount < 3) {
          var metaReferral = JSON.parse(JSON.stringify(referralUser));
          delete metaReferral.ac_ledgers;
          sponsorUser.ac_ledgers[0].credit(2500, "referral", metaReferral);
        }
        referralUser.sponsor = sponsor_code;
        resolve(referralUser);
      });
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};

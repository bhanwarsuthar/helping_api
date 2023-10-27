const { Pin, User, AcLedger, PinTransaction, Media, Team, History, sequelize } = require("../../models");
const fs = require("fs");
const { Op, Sequelize, QueryTypes, INTEGER } = require("sequelize");
const { ResMessageError } = require("../../exceptions/customExceptions");
const { reject } = require("bluebird");
const moment = require("moment");

exports.pins = (params) => {
  return Pin.paginate(
    parseInt(params?.limit) || 10,
    {
      order: [["start_time", "DESC"]],
    },
    params?.page || 1
  );
};

exports.preBookingPins = async (params) => {
  const activeReleasePin = await this.activeSinglePin();
  console.log(activeReleasePin.end_time);
  return PinTransaction.paginate(
    parseInt(params?.limit) || 10,
    {
      order: [["created_at", "DESC"]],
      where: {
        pin_id: activeReleasePin.id,
        created_at: {
          [Op.lt]: activeReleasePin.end_time,
        },
      },
      include: [
        {
          model: User,
          as: "provide",
        },
        {
          model: User,
          as: "receive",
        },
        {
          model: Pin,
          as: "pin",
        },
      ],
    },
    params?.page || 1
  );
};

exports.activeSinglePin = () => {
  return Pin.findOne({
    where: {
      status: "active",
    },
    order: [["start_time", "DESC"]],
  });
};

exports.singlePin = (id) => {
  return Pin.findOne({
    where: {
      id: id,
    },
  });
};

exports.pinActive = (id) => {
  return Pin.findByPk(id).then(async (pin) => {
    pin.status = "active";
    await pin.save();
    return id;
  });
};

exports.pinDeactive = async (id) => {
  var pin = await Pin.findByPk(id);
  pin.status = "deactive";
  await pin.save();
  return id;
};

exports.createPin = async (data) => {
  try {
    return await Pin.create({
      title: data.title,
      pin_amount: data.pin_amount,
      provide_help_amount: data.provide_help_amount,
      receive_help_amount: data.receive_help_amount,
      total_count: data.total_count,
      temp_count: data.temp_count,
      remaining_count: data.temp_count,
      generate_link_count: data.generate_link_count,
      start_time: moment.utc(data.start_time).local(),
      end_time: moment.utc(data.end_time).local(),
      status: data.status,
    });
  } catch (e) {
    throw new ResMessageError(e.message);
  }
};

exports.updatePin = async (data) => {
  var item = await this.singlePin(data.id);
  var remainingCount = await PinTransaction.count({ where: { pin_id: item.id } });
  console.log("item", item);
  item.title = data.title !== undefined ? data.title : item.title;
  item.pin_amount = data.pin_amount !== undefined ? data.pin_amount : item.pin_amount;
  item.provide_help_amount = data.provide_help_amount !== undefined ? data.provide_help_amount : item.provide_help_amount;
  item.receive_help_amount = data.receive_help_amount !== undefined ? data.receive_help_amount : item.receive_help_amount;
  item.total_count = data.total_count !== undefined ? data.total_count : item.total_count;
  item.temp_count = data.temp_count !== undefined ? data.temp_count : item.temp_count;
  item.remaining_count = Number(data.temp_count) - Number(remainingCount);
  item.generate_link_count = data.generate_link_count !== undefined ? data.generate_link_count : item.generate_link_count;
  item.start_time = data.start_time !== undefined ? moment.utc(data.start_time).local().format("YYYY-MM-DDTHH:mm:SS.sss") : item.start_time;
  item.end_time = data.end_time !== undefined ? moment.utc(data.end_time).local().format("YYYY-MM-DDTHH:mm:SS.sss") : item.end_time;
  item.status = data.status !== undefined ? data.status : item.status;
  await item.save();
  return item;
};

exports.preBookingPin = async (body, res) => {
  const mobileNumber = body.mobile;
  const pinId = body.pin_id;
  const quantity = Number(body.quantity);
  if (quantity == 0) {
    throw new ResMessageError("Invalid Quantity");
  }
  let pin = await Pin.findByPk(Number(pinId));
  if (!pin) {
    throw new ResMessageError("Pin Not Found");
  }
  var user = await User.findOne({
    where: { mobile: mobileNumber },
    include: {
      model: AcLedger,
      as: "ac_ledgers",
      where: { slug: "cash-wallet" },
    },
  });
  if (!user) {
    throw new ResMessageError("User Not Found");
  }
  /**
   * this condition for check pin availablity and user wallet amount
   */
  if (pin.remaining_count < Number(quantity)) {
    throw new ResMessageError(`${quantity} Quantity not available`);
  }
  if (Number(user.ac_ledgers[0].balance) < Number(pin.pin_amount) * Number(quantity)) {
    throw new ResMessageError("Wallet Amount is not enough...");
  }
  var meta = JSON.parse(JSON.stringify({ ref_no: "0" }));
  if (pin.remaining_count > Number(quantity)) {
    let prebookingPinList = [];
    for (let index = 0; index < Number(quantity); index++) {
      prebookingPinList.push({
        provide_user_id: user.id,
        pin_id: pin.id,
        status: "pending",
      });
    }

    let pinTransactions = PinTransaction.bulkCreate(prebookingPinList);

    var debitUserTransaction = user.ac_ledgers[0].debit(parseInt(pin.pin_amount) * Number(quantity), "admin", meta);
    pin.remaining_count = pin.remaining_count - Number(quantity);
    let updatedPin = pin.save();
    return Promise.all([pinTransactions, debitUserTransaction, updatedPin])
      .then(([pinTransactions, debitUserTransaction, updatedPin]) => {
        return new Promise(async (resolve, reject) => {
          if (!pinTransactions && !debitUserTransaction && !updatedPin) return reject("Pin purchase next time...");
          let pin = await this.singlePin(pinId);
          resolve(pin);
        });
      })
      .catch((err) => {
        throw new ResMessageError(err.message);
      });
  } else {
    throw new ResMessageError("All Pin soldout...");
  }
};

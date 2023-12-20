const { CommonData } = require("../../models");

exports.commonData = async () => {
  return CommonData.findAll();
};

exports.commonDataByKey = async (key) => {
  return CommonData.findOne({
    where: {
      key,
    },
  });
};

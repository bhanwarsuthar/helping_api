const { ResMessageError } = require("../../exceptions/customExceptions");
const { Level } = require("../../models");

exports.getAllLevels = () => {
  return Level.findAll({ order: [["level", "ASC"]] });
};

exports.addLevel = (data) => {
  return Level.create({
    level: data.level,
    title: data.title,
    percentage: data.percentage,
  });
};

exports.addLevel = (data) => {
  return Level.create({
    level: data.level,
    title: data.title,
    percentage: data.percentage,
  }).catch((err) => {
    throw !err?.message ? err : err.errors[0];
  });
};

exports.updateLevel = (levelId, changes) => {
  return Level.findByPk(levelId)
    .then((level) => {
      if (!level) {
        throw new ResMessageError("Level not found", 404);
      } else {
        return level.update(changes);
      }
    })
    .catch((err) => {
      throw err?.message ? err : err.errors[0];
    });
};

exports.deleteLevel = (levelId) => {
  return Level.findByPk(levelId)
    .then((level) => {
      if (!level) {
        throw new ResMessageError("Level not found", 404);
      } else {
        return level.destory();
      }
    })
    .catch((err) => {
      throw err?.message ? err : err.errors[0];
    });
};

exports.getLevel = (level) => {
  return Level.findOne({ level });
};

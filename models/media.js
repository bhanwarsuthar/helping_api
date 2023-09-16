'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

  class Media extends Model {

    
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {

    }

  };
  
  function buildMediaURL(disk, path){
    if(!path) return null;
    let url = "";
    if(disk == "local"){
      url = process.env.API_BASE_URL+'/'+path;
    }
    if(disk == "s3"){
      url = 'https://s3.south-ab-1.aws.amazon.com/'+path;
    }
    return url;
  }

  Media.init({
    uuid: { type : DataTypes.STRING },
    model_id: DataTypes.BIGINT,
    model_type: DataTypes.STRING,
    collection: DataTypes.STRING,
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    mime: DataTypes.STRING,
    size: DataTypes.INTEGER,

    path: {
      type: DataTypes.STRING,
      get() {
        let disk = this.getDataValue('disk');
        let path = this.getDataValue('path');
        if(!path){
          return process.env.API_BASE_URL+'/images/dummy-product-image-large.jpg';
        }
        return buildMediaURL(disk, path);
      }
    },
    pic_thumbnail: {
      type: DataTypes.STRING,
      get() {
        let disk = this.getDataValue('disk');
        let path = this.getDataValue('pic_thumbnail');
        return buildMediaURL(disk, path);
      }
    },
    pic_medium: {
      type: DataTypes.STRING,
      get() {
        let disk = this.getDataValue('disk');
        let path = this.getDataValue('pic_medium');
        return buildMediaURL(disk, path);
      }
    },
    pic_large: {
      type: DataTypes.STRING,
      get() {
        let disk = this.getDataValue('disk');
        let path = this.getDataValue('pic_large');
        return buildMediaURL(disk, path);
      }
    },
    sort_order: DataTypes.INTEGER,

    disk: DataTypes.STRING,
    created_at: DataTypes.DATE

  }, {
    sequelize,
    modelName: 'Media',
    tableName: 'media',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return Media;
};
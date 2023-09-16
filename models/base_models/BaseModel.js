'use strict';
const {
  Model
} = require('sequelize');

class BaseModel extends Model {

  static async paginate(limit, conditions = {}, page = 1){
    limit = Number(limit);
    if(limit > 50){
      limit = 50
    }

    let offset = page * limit;

    var options = Object.assign(conditions,{offset: offset-limit, limit: limit});

    var result;
    try{
     result = await this.findAndCountAll(options);
    }catch(err){
      console.log("error", err)
    }
    let last_page = result.count / limit;
    last_page = last_page > 0 ? Math.ceil(last_page) : 1;
  
    return {
      meta: {
        page_size: limit,
        total: result.count,
        current_page: parseInt(page),
        last_page: last_page,
        total_pages: last_page
      },
      rows: result.rows,
    };
  }

    static async getOrCreate(values, where){
      this.findOne({where: where}).then(row => {
         if(row){
           return row;
         }else{
           return this.create(values)
         }
      })
    }
};

module.exports = { BaseModel }
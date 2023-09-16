const { Match, Media, Team } = require("../models")
const fs = require("fs");
const { Op } = require("sequelize");

exports.matches = (type) => {
    let filters = {};
    let ts = Date.now();

    let date_time = new Date(ts);
    let date = date_time.getDate();
    let month = date_time.getMonth() + 1;
    let year = date_time.getFullYear();

    let orderDate = 'DESC';
    if (type == 'today') {
        var normalDate = year + "-" + month + "-" + date
        filters.date = {
            [Op.between]: [new Date(normalDate + ' 00:00:00'), new Date(new Date(normalDate + ' 23:59:59').getTime() + 60 * 60 * 24 * 1000 - 1) ]
        };
        orderDate = 'ASC';
    } else if (type == 'history') {
        filters.date = {
            [Op.lt]: new Date()
        };
        orderDate = 'DESC';
    } else if (type == 'future') {
        filters.date = {
            [Op.gte]: new Date()
        };
        orderDate = 'ASC';
    }


    console.log("date " + filters.date);
    return Match.findAll({
        where: filters,
        include: [{
            model: Team,
            as: 'team1',
            include: [{
                model: Media,
                as: 'media'
            }]
        },
        {
            model: Team,
            as: 'team2',
            include: [{
                model: Media,
                as: 'media'
            }],
        }],
        order: [
            ['date', orderDate],
        ]
    });
}

exports.singleMatch = (id) => {
    return Match.findOne({
        where: {
            id: id
        },
        include: [{
            model: Team,
            as: 'team1'
        },
        {
            model: Team,
            as: 'team2'
        }]
    });
}

exports.updateMatch = async (data) => {
    var item = await Match.findOne({ where: { id: Number(data.id) } });
    console.log("item", item)
    item.date = data.date !== undefined ? new Date(data.date) : new Date(item.date);
    item.team_id1 = data.team_id1 !== undefined ? data.team_id1 : item.team_id1;
    item.team_id2 = data.team_id2 !== undefined ? data.team_id2 : item.team_id2;
    item.team1_run = data.team1_run !== undefined ? data.team1_run : item.team1_run;
    item.team1_wicket = data.team1_wicket !== undefined ? data.team1_wicket : item.team1_wicket;
    item.team2_run = data.team2_run !== undefined ? data.team2_run : item.team2_run;
    item.team2_wicket = data.team2_wicket !== undefined ? data.team2_wicket : item.team2_wicket;
    item.result = data.result !== undefined ? data.result : item.result;
    await item.save();
    return await this.singleMatch(data.id);
}


exports.createMatch = async (data) => {
    var player = await Match.create({
        'team_id1': data.team_id1,
        'team_id2': data.team_id2,
        'team1_run': data.team1_run,
        'team1_wicket': data.team1_wicket,
        'team2_run': data.team2_run,
        'team2_wicket': data.team2_wicket,
        'result': data.result,
        'date': new Date(data.date) || new Date(),
    });
    return await this.singleMatch(player.id);
}

exports.deleteMatch = async (data) => {
    var item = await this.singleMatch(data.id);
    await item.destroy();
    return item;

}

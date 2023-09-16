const { History, Media, Team, Player } = require("../models")

exports.histories = (queryData) => {
    let filters = {};
    if (queryData.player_id) {
        filters.player_id = queryData.player_id;
    }
    if (queryData.match_id) {
        filters.match_id = queryData.match_id;
    }
    console.log("player_id " + filters);
    return History.findAll({
        where: filters,
        include: [{
            model: Player,
            as: 'player',
            include: [{
                model: Media,
                as: 'media'
            }]
        }],
        order: [
            ['created_at', 'DESC'],
        ]
    });
}

exports.singleHistory = (id) => {
    return History.findOne({
        where: {
            id: id
        },
        include: [{
            model: Player,
            as: 'player'
        }]
    });
}

exports.updateHistory = async (data) => {
    var item = await this.singleHistory(data.id);
    console.log("item", item)
    console.log(new Date(data.created_at));
    item.player_id = data.player_id !== undefined ? data.player_id : item.player_id;
    item.match_id = data.match_id !== undefined ? data.match_id : item.match_id;
    item.run = data.run !== undefined ? data.run : item.run;
    item.wicket = data.wicket !== undefined ? data.wicket : item.wicket;
    item.catch = data.catch !== undefined ? data.catch : item.catch;
    item.stumping = data.stumping !== undefined ? data.stumping : item.stumping;
    item.run_out = data.run_out !== undefined ? data.run_out : item.run_out;
    item.direct_hit_run_out = data.direct_hit_run_out !== undefined ? data.direct_hit_run_out : item.direct_hit_run_out;
    item.maiden_over = data.maiden_over !== undefined ? data.maiden_over : item.maiden_over;

    await item.save();
    return await this.singleHistory(data.id);
}


exports.createHistory = async (data) => {
    var history = await History.create({
        'player_id': data.player_id,
        'match_id': data.match_id,
        'run': data.run || 0,
        'wicket': data.wicket || 0,
        'catch': data.catch || 0,
        'stumping': data.stumping || 0,
        'run_out': data.run_out || 0,
        'direct_hit_run_out': data.direct_hit_run_out || 0,
        'maiden_over': data.maiden_over || 0,
        'score': getScore(data.run || 0,
            data.wicket || 0,
            data.catch || 0,
            data.stumping || 0,
            data.run_out || 0,
            data.direct_hit_run_out || 0,
            data.maiden_over || 0)
    });
    return history;
}

function getScore(run, wicket, catchData, stumping, run_out, direct_hit_run_out, maiden_over){
    let result = (run*1) + (wicket*25) + (catchData*8) + (stumping*12) + (run_out*6) + (direct_hit_run_out*12) + (maiden_over*12)
    return result
}

exports.deleteHistory = async (data) => {
    var item = await this.singleHistory(data.id);
    await item.destroy();
    return item;
}

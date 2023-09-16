const { Player, Media, Team, History, sequelize } = require("../models")
const fs = require("fs");
const { Op, Sequelize, QueryTypes, INTEGER } = require('sequelize');
exports.players = (team_id) => {
    let filters = {};
    if (team_id) {
        filters.team_id = team_id;
    }
    console.log("team_id " + filters);
    return Player.findAll({
        where: filters,
        include: [{
            model: Media,
            as: 'media'
        }, {
            model: Team,
            as: 'team'
        }],
        order: [
            ['created_at', 'DESC'],
        ]
    });
}

exports.playerPrediction = async (params) => {
    var options = {
        type: Sequelize.QueryTypes.SELECT,
        plain: false,
    };

    let players = [];
    if (params.team_id1 && params.team_id2) {
        players = await sequelize.query("SELECT players.id, players.name, players.bowler, players.wicket_keeper, players.batsman, players.all_rounder, media.pic_medium, SUM(histories.score) as scores FROM players INNER JOIN histories ON histories.player_id = players.id INNER JOIN media ON media.id = players.media_id where (players.team_id = " + params.team_id1 + " OR players.team_id = " + params.team_id2 + ") GROUP BY players.id, players.name, players.bowler, players.wicket_keeper, players.batsman, players.all_rounder, media.pic_medium;", options);
    }

    let sortedPlayers = players.sort((a, b) => b.scores - a.scores);

    if (params.removePlayers) {
        let arrayRemovePlayers = params.removePlayers;
        try {
            sortedPlayers = sortedPlayers.filter(item => !arrayRemovePlayers.includes(String(item.id)))
        } catch (err) {
            console.log(err);
        }
    }

    if (params.advanceSettings && Number(params.advanceSettings) === 1) {
        return sortedPlayers;
    }


    // Sort the players by their common score in descending order



    // Initialize the teams array
    const teams = [];
    const team = [];
    const remainingTeams = [];
    // Add the top player to the team

    // Add at least 1 bowler, 1 wicket keeper, and 1 batsman to the team
    let bowlerAdded = false;
    let wicketKeeperAdded = false;
    let batsmanAdded = false;
    let allRounderAdded = false;
    for (let j = 0; j < sortedPlayers.length; j++) {
        if (!bowlerAdded && sortedPlayers[j].bowler) {
            team.push(sortedPlayers[j]);
            bowlerAdded = true;
        } else if (!wicketKeeperAdded && sortedPlayers[j].wicket_keeper) {
            team.push(sortedPlayers[j]);
            wicketKeeperAdded = true;
        } else if (!batsmanAdded && sortedPlayers[j].batsman) {
            team.push(sortedPlayers[j]);
            batsmanAdded = true;
        } else if (!allRounderAdded && sortedPlayers[j].all_rounder) {
            team.push(sortedPlayers[j]);
            allRounderAdded = true;
        } else {
            remainingTeams.push(sortedPlayers[j]);
        }
    }

    const numOfGroups = params.prediction_counts || 10;
    for (let i = 0; i < numOfGroups; i++) {
        const selectedScores = remainingTeams
            .sort(() => Math.random() - 0.5) // Shuffle the scores randomly
            .slice(0, 7);
        teams.push(selectedScores.concat(team).reverse());
    }
    return teams;
}






exports.singlePlayer = (id) => {
    return Player.findOne({
        where: {
            id: id
        },
        include: [{
            model: Media,
            as: 'media'
        },
        {
            model: Team,
            as: 'team'
        }]
    });
}

exports.updatePlayer = async (data) => {
    if (data.uuid) {
        var media = await Media.findOne({ where: { uuid: data.uuid, collection: 'temp' } })
        if (media) {
            media.model_id = data.id;
            media.model_type = 'team';
            media.collection = 'fixed';
            data.media_id = media.id;
            await media.save();
        }
    }
    var item = await this.singlePlayer(data.id);
    console.log("item", item)
    item.name = data.name !== undefined ? data.name : item.name;
    item.team_id = data.team_id !== undefined ? data.team_id : item.team_id;
    item.rate = data.rate !== undefined ? data.rate : item.rate;
    item.media_id = data.media_id !== undefined ? data.media_id : item.media_id;
    item.bowler = data.bowler !== undefined ? data.bowler : item.bowler;
    item.wicket_keeper = data.wicket_keeper !== undefined ? data.wicket_keeper : item.wicket_keeper;
    item.batsman = data.batsman !== undefined ? data.batsman : item.batsman;
    item.all_rounder = data.all_rounder !== undefined ? data.all_rounder : item.all_rounder;

    await item.save();
    return await this.singlePlayer(data.id);
}


exports.createPlayer = async (data) => {
    var player = await Player.create({
        'team_id': data.team_id,
        'name': data.name || "",
        'bowler': data.bowler || 0,
        'wicket_keeper': data.wicket_keeper || 0,
        'batsman': data.batsman || 0,
        'all_rounder': data.all_rounder || 0,
        'rate': data.rate || '0'
    });
    if (data.uuid) {
        var media = await Media.findOne({ where: { uuid: data.uuid, collection: 'temp' } })
        if (media) {
            media.model_id = player.id;
            media.model_type = 'player';
            media.collection = 'fixed';
            await media.save();
            player.media_id = media.id;
            await player.save();
            return await this.singlePlayer(player.id);
        }
    }
    return player;
}

exports.deletePlayer = async (data) => {

    var player = await this.singlePlayer(data.id);
    var folderName = player.media?.uuid;
    if (folderName) {
        let destination = "uploads/" + folderName;
        fs.rmdir(__basedir + "/" + destination, (err) => {
            console.log(err);
        })
    }
    await player.destroy();
    return player;

}

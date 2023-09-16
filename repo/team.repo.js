const { Team, Media } = require("../models")
const fs = require("fs");

exports.teams = () => {
    return Team.findAll({
        include: [{
            model: Media,
            as: 'media'
        }],
        order: [
            ['created_at', 'DESC'],
        ]
    });
}

exports.singleTeam = (id) => {
    return Team.findOne({
        where : {
            id: id
        },
        include: [{
            model: Media,
            as: 'media'
        }]
    });
}


exports.updateTeam = async (data) => {
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
    var item = await this.singleTeam(data.id);
    console.log("item", item)
    item.full_name = data.full_name !== undefined ? data.full_name : item.full_name;
    item.short_name = data.short_name !== undefined ? data.short_name : item.short_name;
    item.media_id = data.media_id !== undefined ? data.media_id : item.media_id;
    await item.save();
    return await this.singleTeam(data.id);
}

exports.deleteTeam = async (data) =>{

    var team = await this.singleTeam(data.id);
    var folderName = team.media?.uuid;
    if(folderName){
        let destination = "uploads/"+folderName;
        fs.rmdir(__basedir+"/"+destination, (err) =>{
            console.log(err);
        })
    }
    await team.destroy();
    return team;

}

exports.createTeam = async (data) => {
    var team = await Team.create({
        'full_name': data.full_name,
        'short_name': data.short_name
    });
    if (data.uuid) {
        var media = await Media.findOne({ where: { uuid: data.uuid, collection: 'temp' } })
        if (media) {
            media.model_id = team.id;
            media.model_type = 'team';
            media.collection = 'fixed';
            await media.save();
            team.media_id = media.id;
            await team.save();
            return await this.singleTeam(team.id);
        }
    }
    return team;


}

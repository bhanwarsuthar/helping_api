const { Notification, sequelize } = require('../../models');


exports.module = async function (database) {
    let args = database.to_database();
    Notification.create(args)  
     .then(done => {
        console.log("Notification added.")
    })
    .catch(err => {
        console.log("Error => ",err.message)
    })
}
// npx sequelize-cli db:migrate  
// sequelize db:migrate 
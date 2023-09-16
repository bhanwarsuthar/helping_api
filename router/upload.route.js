const express = require('express');
const router = express.Router();
const multer  = require('multer')
const sharp = require('sharp');
const { Media } = require('../models');
const {v4 : uuidv4} = require('uuid')
const fs = require("fs");
const { CommonResponse } = require('../response/successResponse'); 

const storage = multer.memoryStorage()

const upload = multer( { 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/webp") {
            cb(null, true);
          } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg, .webp and .jpeg format allowed!'));
          }
    },
    // limits:{
    //     fileSize: 1024 * 1024
    // }
} );

//const upload = multer({ dest: 'uploads/' })

router.post('/photos/single', 
    upload.single('photo'),
    async (req, res) => {
      let file = req.file
      const uuid = uuidv4();
      let destination = "uploads/"+uuid;
      
      fs.mkdir(__basedir+"/"+destination, {}, (err) => {
          if(err){
              console.log(err)
          }else{
              console.log("new directory created");
          }
      });
  
      var pic_thumbnail = destination+"/pic_thumbnail.webp";
      var pic_medium = destination+"/pic_medium.webp";
      var pic_large = destination+"/pic_large.webp";
      var path = pic_large;
  
      await sharp(file.buffer)
          .resize({ width: 150, height: 150, fit: 'inside'})
          .toFormat('webp')
          .toBuffer().then(data => {
              fs.writeFile(__basedir+"/"+pic_thumbnail, data, (err,info) => {
                  if(err){
                      console.log(err);
                  }
              });
          })
      await sharp(file.buffer)
          .resize({ width: 400, height: 400, fit: 'inside'})
          .toFormat('webp')
          .toBuffer().then(data => {
              fs.writeFile(__basedir+"/"+pic_medium, data, (err,info) => {
                  if(err){
                      console.log(err);
                  }
              });
          })
      await sharp(file.buffer)
          .resize({ width: 1080, height: 1080, fit: 'inside'})
          .toFormat('webp')
          .toBuffer().then(data => {
              fs.writeFile(__basedir+"/"+pic_large, data, (err,info) => {
                  if(err){
                      console.log(err);
                  }
              });
          })
  
      let media = await Media.create({
          uuid: uuid,
          path: path,
          mime: file.mimetype,
          name: file.originalname,
          disk: "local",
          type: "image",
          pic_thumbnail: pic_thumbnail,
          pic_medium: pic_medium,
          pic_large: pic_large,
          collection: "temp"
      });
      return res.json(
        new CommonResponse(200, 'successfully uploaded.', {
            uuid: media.uuid, 
            name: media.name,
            path: media.path,
            pic_thumbnail: media.pic_thumbnail,
            pic_medium: media.pic_medium,
            pic_large: media.pic_large,
        }));
  });


module.exports = router;
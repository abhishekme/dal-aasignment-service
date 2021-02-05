'use strict'

//Get ORM object
var userController          = require('./user');
var constants               = require('../../config/constants');
//var bCrypt                  = require('bcrypt-nodejs');
var bCrypt                  = require('bcrypt');
var crypto                  = require('crypto'); 

const { body,validationResult,check } = require('express-validator');
const Sequelize             = require('sequelize');
const Op                    = Sequelize.Op;
const db                    = require('../models');
const theModel              = db.orders; 

const theContr              = userController;
const variableDefined       = constants[0].application;
const fs                    = require('fs');
var passCrypto              = require('../../config/passCrypto');
//return 
const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config.json')[env];

var saltPassword = '';
const jwt = require("jsonwebtoken");

// console.log('@Model: ', orderModel);
// console.log("@Data: ");
// orderModel.findAll().then(result => {
//       console.log("@@@@Order daata: ", result[0].dataValues);
// })

//-----------------------------------------------------------------------
//---------------- API Required Field Validation ------------------------
//-----------------------------------------------------------------------
exports.validate = (method) => {
  switch (method) {
    case 'create' : {
     return [ 
        body('first_name', variableDefined.variables.first_name_required).exists(),
        body('last_name', variableDefined.variables.last_name_required).exists(),
        body('username', variableDefined.variables.username_required).exists(),
        body('email', variableDefined.variables.email_required).exists().isEmail(),
        body('password')  
            .exists().withMessage(variableDefined.variables.password_required)
            .isLength({ min: 5, max:15 }).withMessage(variableDefined.variables.password_strength_step1)
            .matches(/^((?=.*\d)(?=.*[A-Z])(?=.*\W).{5,15})$/).withMessage(variableDefined.variables.password_strength_step2),
       ]   
    }
    case 'login' : {
      return [ 
         body('email', variableDefined.variables.email_required).exists().isEmail(),
         body('password', variableDefined.variables.password_required).exists(),
        ]   
     }
    case 'update' : {
      return [ 
         body('first_name', variableDefined.variables.first_name_required).exists(),
         body('last_name', variableDefined.variables.last_name_required).exists(),
         body('username', variableDefined.variables.username_required).exists(),
         body('password')  
            .exists().withMessage(variableDefined.variables.password_required)
            .isLength({ min: 5, max:15 }).withMessage(variableDefined.variables.password_strength_step1)
            .matches(/^((?=.*\d)(?=.*[A-Z])(?=.*\W).{5,15})$/).withMessage(variableDefined.variables.password_strength_step2),
         body('email', variableDefined.variables.email_required).exists().isEmail()
        ]   
     }
  }
}
exports.apiValidation   = function(req,resp){
  const errors          = validationResult(req);
  var validationErr     = [];
  var validationErrMesg = [];
  errors.array().forEach(error => {
      let found = validationErr.filter(errItem => error.param === errItem.param);
      if (!found.length) {
        validationErr.push(error);
      }      
  });
  //console.log(validationErr);
  if(validationErr.length){
    validationErr.forEach(rec => {
       validationErrMesg.push({field: rec.param, message: rec.msg});
    })
    resp.status(422).json({ errors: validationErrMesg, status:0 });
    return true;
  }
  return false;
}
//-----------------------------------------------------------------------
//-----------------API Required Field Validation ------------------------
//-----------------------******** END ********** ------------------------
//-----------------------------------------------------------------------
exports.hashPassword  = function(password){

  // Creating a unique salt for a particular user 
  saltPassword = crypto.randomBytes(16).toString('hex');  
  // Hashing user's salt and password with 1000 iterations, 
  //64 length and sha512 digest 
  let hashPassword = crypto.pbkdf2Sync(password, saltPassword,  
  1000, 64, `sha512`).toString(`hex`);
  console.log('Passw: ', hashPassword);
  return hashPassword;
}
exports.isLoggedIn  = function (req, res, next) {
      // if user is authenticated in the session, carry on 
    var curSession  = req.session;  
    if(curSession.userRec !=  undefined && curSession.userRec.id > 0){
        res.json({ message: variableDefined.variables.logged_in, status:1 });
        return next();
    }
    res.json({ message: variableDefined.variables.logged_out, status:0 });
    return;
}
/*-----------------------------------
/-------------LOGOUT USER------------
/---@body: NULL
/------------------------------------
------------------------------------*/
exports.logout   = function(req, res){
  req.session.destroy((err) => {
    if(err) {
      return console.log({message: variableDefined.variables.logout_unSuccess, status:0, error:err});
    }
    res.json({message: variableDefined.variables.logout_success, status:0});    
  });
}

/*-----------------------------------
/-------------LOGIN USER-------------
/---@body: [email, password] --------
/------------------------------------
------------------------------------*/
exports.login  = function(req, resp){
    var postBody  = req.body || null;
    //Add required validation
    theContr.apiValidation(req, resp);
    if(postBody.email != undefined && postBody.password != undefined){
      if(postBody.email){
        theModel.findOne({           
          where: {
           email: postBody.email
         }
        }).then(result => { 
            if(result === null || result === undefined){
              resp.json({ message: 'Email Not Exists!',status : 0 });
              return;
            }
            if(result.dataValues.id > 0){
               var getRecord  = result;
               var dbPassword = getRecord.password;              
               //console.log("Pass: ", " -- ", dbPassword, " -- ",getRecord.salt );
              if(!theModel.validPassword(dbPassword, postBody.password , getRecord.salt)){
                resp.json({ message: 'Password Not Valid, Please check',status : 0 });
                return;
              }
              var userRec = result.dataValues;
              console.log(userRec);
              //if(req.session != undefined){
                //var curSession  = req.session;
                //curSession.userRec = userRec;
                let payload = {};
                payload['id'] = userRec.id;
                payload['email'] = userRec.email;
                console.log("payload: ", payload);
                //{ email: userRec.email, firstName: userRec.first_name, id: userRec.id }
              let authToken = jwt.sign(payload, config.jwt_secret);
                //jwt.sign(payload, config.jwt_secret);
                //return resp.json({ status: 1, message:"Login Success",token: jwt.sign({ email: user.email, firstName: user.firstName, _id: user._id }, 'TOKEN!1977') });
                console.log("JWT: ", authToken);
                resp.json({ message: 'Login success', authToken: authToken, status : 1});
              //}
           }
        });
      }      
    }
}

//Add List with pagination limit
/*-----------------------------------
/-------------LIST USER--------------
/---@body: NULL ---------------------
/------------------------------------
------------------------------------*/
exports.getList = function(req, res) {
  theModel.findAll().then( (result) => res.json(result))
};

/*-----------------------------------
/-------------CREATE USER -----------
/---@body: [id, email,username]------
/------------------------------------
------------------------------------*/
exports.create  = function(req, resp) {    

  //Add required validation
  var validReturn   = theContr.apiValidation(req, resp);
  if(validReturn) return;
  
  var getData   = req.body || null;
  
  if(typeof getData === 'object'){
     var getEmail       = getData.email || '';
     var getUserName    = getData.username;
     if(getEmail){
         theModel.findOne({           
           where: {
            [Op.or]: [{email: getEmail}, {username: getUserName}]
          }
         }).then(result => {
           if(result != null){
             resp.json({ message: variableDefined.variables.email_or_username_exists,record : result });
             return;
           }
           if(result === null){
            if(getData.password != undefined){
               var hashPassword = theContr.hashPassword(getData.password);
               if(hashPassword) getData.password = hashPassword;
               if(req.body){
                getData.salt = saltPassword;
              }
              console.log(">>> body ", getData);
            }
            theModel.create(getData).then((insertRecord) => {
              if(insertRecord.dataValues.id != undefined &&  insertRecord.dataValues.id > 0){
                resp.json({ message: 'Record Inserted!',status : 1, record: insertRecord });
                return;
              }
            })
          }
        });
     }
     return;
  }
};

/*-----------------------------------
/-------------UPDATE USER -----------
/---@body: [id, email,username]------
/------------------------------------
------------------------------------*/
exports.update = function(req, resp) {
  //Add required validation
  //var validReturn   = theContr.apiValidation(req, resp);
  //if(validReturn)   return;

  console.log('Check headers: ', req.headers, " :: ", req.method);
  return false;

  var getData     = req.body || null;
  var getId       = req.body.id || 0;
  var getEmail    = req.body.email || '';
  var getUserName = req.body.username || '';
  //image upload processing
  var getApiImage =  req.body.profile_pic || '';
  delete req.body.id;

  if(!getId){
    resp.json({ message: variableDefined.variables.id_not_found,status : -1 }); 
    return;
  }
  else if(getEmail != null && getUserName != null){
      theModel.findAll(
      { where: { 
        [Op.or]: [
          {email: getEmail}, {username: getUserName}
        ], 
        id:
          { [Op.ne] : getId}                        
        }}).then(result => {
          var findRec = result;
          console.log("UserRec: ",findRec);
          if(findRec.length > 0){
            resp.json({ message: variableDefined.variables.email_exists, status : 0,record: findRec }); 
            return;
          }
          if(!findRec.length){
            if(getData.password != undefined){
              var hashPassword = theContr.hashPassword(getData.password);
              if(hashPassword) getData.password = hashPassword;
            }
            //processing image
            if(getApiImage != null){
              // to declare some path to store your converted image
              var fileName      = getId + "_" + getData.first_name + variableDefined.variables.user_picture_extension;

              //old_filename    = Date.now() + variableDefined.variables.user_picture_extension
              const path        = variableDefined.serverPath.userUploadDir + fileName.toString().trim();
              const imgdata     = getApiImage;
              //const img = 'data:image/png;base64,aBdiVBORw0fKGgoAAA';
              const bufferSize    = Buffer.from(imgdata.substring(imgdata.indexOf(',') + 1));
              const bufferLength  = bufferSize.length;
              const uploadSize    = bufferSize.length / 1e+6;
              //console.log("Byte length: " + bufferSize.length);
              //console.log("MB: " + bufferSize.length / 1e+6);
              if(uploadSize != null && uploadSize >=2){
                resp.json({ message: variableDefined.variables.image_upload_max_size, status : 0 });
                return;
              }
              // to convert base64 format into random filename
              const base64Data  = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');              
              fs.writeFileSync(path, base64Data,  {encoding: variableDefined.variables.user_picture_upload_encoding});
            }
            theModel.update(getData,
            {
              where: {
                id: getId
              }
            }).then((result) => {
              if(result){
                resp.json({ message: variableDefined.variables.record_updated, status : result });
                return;
              }
              else
                resp.json({ message: variableDefined.variables.record_update_error, status : result });
                return;
              })
          }
    });
  }   
};

//API Guard
/****************
 * () => APIGuard
 * require Token from headers
 */
exports.authRequired = function(req, res, next) {
  if (req.user) {
    next();
  } else {  
    return res.status(401).json({ status: 0, message: 'Valid Token Required!' });
  }
};
/*-----------------------------------
/------------- DELETE USER ----------
/---@param: id [i.e. /user?id=]------ 
/------------------------------------
------------------------------------*/
exports.delete = function(req, resp) {
  theModel.destroy({
    where: {
      id: req.query.id
    }
  }).then((result) => {
      if(result)
        resp.json({ message: variableDefined.variables.record_deleted,'status' : result });
      else
        resp.json({ message: variableDefined.variables.record_deleted_error,'status' : result });
  })
};

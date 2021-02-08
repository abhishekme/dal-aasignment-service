'use strict'

//Get ORM object
var userController          = require('./user');
var constants               = require('../../config/constants');
var crypto                  = require('crypto'); 

const { body,validationResult,check } = require('express-validator');
const Sequelize             = require('sequelize');
const Op                    = Sequelize.Op;
const db                    = require('../models');
const theModel              = db.user; 
const variableDefined       = constants[0].application;
const fs                    = require('fs');
const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config.json')[env];

var saltPassword = '';
const jwt = require("jsonwebtoken");

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
  return hashPassword;
}

/*-----------------------------------
/-------------LOGIN USER-------------
/---@body: [email, password] --------
/------------------------------------
------------------------------------*/
exports.login  = function(req, resp){
    var postBody  = req.body || null;
    //Add required validation
    userController.apiValidation(req, resp);
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
              if(!theModel.validPassword(dbPassword, postBody.password , getRecord.salt)){
                resp.json({ message: 'Password Not Valid, Please check',status : 0 });
                return;
              }
                var userRec = result.dataValues;
                let payload = {};
                payload['id']     = userRec.id;
                payload['email']  = userRec.email;
                let authToken = jwt.sign(payload, config.jwt_secret);
                //console.log("JWT: ", authToken);
                resp.json({ message: 'Login success', authToken: authToken, status : 1});
           }
        });
      }      
    }
}


/*-----------------------------------
/-------------CREATE USER -----------
/---@body: [id, email,username]------
/------------------------------------
------------------------------------*/
exports.create  = function(req, resp) {    

  //Add required validation
  var validReturn   = userController.apiValidation(req, resp);
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
               var hashPassword = userController.hashPassword(getData.password);
               if(hashPassword) getData.password = hashPassword;
               if(req.body){
                getData.salt = saltPassword;
              }
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

'use strict'

//Get ORM object
var orderController          = require('./orders');

const { body,validationResult,check } = require('express-validator');
const Sequelize             = require('sequelize');
const Op                    = Sequelize.Op;
const db                    = require('../models');
const theModel              = db.orders; 
var constants               = require('../../config/constants');
const variableDefined       = constants[0].application;
const env                   = process.env.NODE_ENV || 'development';
const config                = require('../../config/config.json')[env];


//-----------------------------------------------------------------------
//---------------- API Required Field Validation ------------------------
//-----------------------------------------------------------------------
exports.validate = (method) => {
  switch (method) {
    case 'create' : {
     return [ 
        body('order_date', variableDefined.variables.order_date_required).exists(),
        body('prod_id', variableDefined.variables.product_id_required).exists(),
        body('order_amount', variableDefined.variables.order_amount_required).exists(),
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
        body('order_date', variableDefined.variables.order_date_required).exists(),
        body('prod_id', variableDefined.variables.product_id_required).exists(),
        body('order_amount', variableDefined.variables.order_amount_required).exists(),
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

//Search Order
/****************
 * () => OrderSearch Fulltext
 * @page    -   pageNumber - optional
 * @size    -   limit - optional
 * 
 */
exports.searchList  =   (req, resp) => {
    let getData = req.body || null;

    if(req.query.page == undefined || req.query.limit == undefined){
        resp.status(400).json({ message: 'Parameter [limit,page] Not found.',status : 0 });
        return;
    }
    let pageNo      = parseInt(req.query.page) || 1;
    let limit       = parseInt(req.query.limit) || 10;
    const offset    = (pageNo-1) * limit;
    const cond      = '%' +getData.query+'%';

    if(getData.query != undefined && getData.query != ''){
            theModel.findAndCountAll({
                limit: limit,
                offset: offset,
                where: { order_date: { [Op.lte]: new Date(getData.query) } }, // conditions
            }).then(function (result) {
                let totalCount = result.count;
                let totalPages = Math.ceil(totalCount / limit);
                let recordData = result.rows;
                resp.status(200).json({ message: 'Order Lists',status : 1, data: recordData, totalRecord:totalCount, totalPage:totalPages, limit: limit });
                return;
            });
    }else{
        productController.getList(req,resp);
    }            
}

/****************
 * () => UserList
 * @page    -   pageNumber
 * @size    -   limit
 * 
 */
exports.getList  =  (req, resp)  =>{
    if(req.query.page == undefined || req.query.limit == undefined){
        resp.status(400).json({ message: 'Parameter [limit,page] Not found.',status : 0 });
        return;
    }  
  let pageNo    = parseInt(req.query.page) || 1;
  let limit      = parseInt(req.query.limit) || 10;
  const offset = (pageNo-1) * limit;
    if(pageNo < 0 || pageNo === 0) {
        let response = {status : 0, message : "invalid page number, should start with 1"};
        return resp.status(401).json(response);
    }    
    theModel.findAndCountAll({
        where: {},
        order: [],
        limit: limit,
        offset: offset,
    }).then(function (result) {
        let totalCount = result.count;
        let totalPages = Math.ceil(totalCount / limit);
        let recordData = result.rows;
        resp.status(200).json({ message: 'Order Lists',status : 1, data: recordData, totalRecord:totalCount, totalPage:totalPages, limit: limit });
        return;
    });
}


/*----------------------------
// Order function
//@params
//
-----------------------------*/

exports.saleOrder = function(req, resp){

    let getReq = req.query.params || null;
    console.log("@get req: ", getReq);

    if(getReq == null || getReq === ''){
        resp.json({ message: 'Please request with order parameter',status : 0});
        return;
     }

    switch(getReq){
      case 'high_sale':
        let execQuery3 = 'select sum(orders.`order_qty`) AS totalQuantity,sum(orders.`order_amount`) AS totalAmount,product.prod_name from orders INNER JOIN product ON product.id = orders.prod_id group by orders.prod_id order by sum(orders.`order_qty`) DESC limit 1';
        db.sequelize.query(execQuery3)
        .then(function(result) {
          let recordData = result[0];
          return resp.status(200).json({ message: 'Order Lists High Sale',status : 1, data: recordData });
        });
      break;

      case 'low_sale':
        let execQuery4 = 'select sum(orders.`order_qty`) AS totalQuantity,sum(orders.`order_amount`) AS totalAmount,product.prod_name from orders INNER JOIN product ON product.id = orders.prod_id group by orders.prod_id order by sum(orders.`order_qty`) ASC limit 1';
        db.sequelize.query(execQuery4)
        .then(function(result) {
          let recordData = result[0];
          return resp.status(200).json({ message: 'Order Lists Low Sale',status : 1, data: recordData });
        });
      break;

      case 'last_three_month':
        let execQuery1 = 'SELECT DATE_FORMAT(order_date, "%m-%Y") AS Month, SUM(order_amount) AS totalAmount FROM orders WHERE order_date < NOW() and order_date > Date_add(Now(), interval - 3 month) GROUP BY DATE_FORMAT(order_date, "%m-%Y") LIMIT 0,3';
        db.sequelize.query(execQuery1)
        .then(function(result) {
          let recordData = result[0];
          return resp.status(200).json({ message: 'Order Lists Last 3 month',status : 1, data: recordData });
        });
      break;

      case 'qty_sale':
        let execQuery2 = 'SELECT DATE_FORMAT(order_date, "%m-%Y") AS Month, SUM(order_qty) AS total_sales, SUM(order_amount) AS totalAmount FROM orders GROUP BY DATE_FORMAT(order_date, "%m-%Y")';
        db.sequelize.query(execQuery2)
        .then(function(result) {
          let recordData = result[0];
         return resp.status(200).json({ message: 'Quantity Sale',status : 1, data: recordData });
        });

      case 'top_sale':
    let execQuery = 'select orders.prod_id,SUM(orders.order_qty) AS totalQuantity, SUM(orders.order_amount) AS totalAmount, product.prod_name from orders INNER JOIN product ON product.id = orders.prod_id where  orders.`order_date` >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY orders.prod_id limit 0,25';
        db.sequelize.query(execQuery)
        .then(function(result) {
          //console.log(">>> result: ", result);
          let recordData = result[0];
          return resp.status(200).json({ message: 'Order Lists',status : 1, data: recordData });
        });
      break;
    }

}


/*-----------------------------------
/-------------CREATE USER -----------
/---@body: [id, email,username]------
/------------------------------------
------------------------------------*/
exports.create  = function(req, resp) {    

  //Add required validation
  var validReturn   = orderController.apiValidation(req, resp);
  if(validReturn) return;
  
  var getData   = req.body || null;
  
  if(typeof getData === 'object'){
     if(getData.order_date != null){
       let ordDate  = new Date(getData.order_date);
       let today    = new Date();
       let calcDays = new Date(today - 7 * 24 * 60 * 60 * 1000);
       console.log('@datae: ', calcDays);
       if(ordDate < calcDays || ordDate > today){
        resp.json({ message: 'Order Date should be Less than 7 Days of Today\'s Date',status : 0});
          return;
       }
       getData.order_date = ordDate;
       console.log("POST: ", getData);
      theModel.create(getData).then((insertRecord) => {
        if(insertRecord.dataValues.id != undefined &&  insertRecord.dataValues.id > 0){
          resp.json({ message: 'Record Inserted!',status : 1, record: insertRecord });
          return;
        }
      })
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

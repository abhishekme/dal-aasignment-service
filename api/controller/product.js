'use strict'

//Declarations
var constants               = require('../../config/constants');
const { body,validationResult,check } = require('express-validator');
const Sequelize             = require('sequelize');
const Op                    = Sequelize.Op;
const db                    = require('../models');

const productController     = require('./product');
const theModel              = db.product; 
const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config.json')[env];


//--------------- START Functons ----------------------

//Search Product by name
/****************
 * () => ProductSearch Fulltext
 * @page    -   search query
 * 
 ****************************/
exports.searchProduct  =   (req, resp) => {
    let getData = req.query || null;

    //let getQuery = getData.srch;
    //const cond      = '%' +getQuery+'%';
    var whereStatement          = {};
    //whereStatement.prod_name    = { [Op.like]: cond };
    whereStatement.prod_exp_date = { [Op.gte]: new Date() };
    
    theModel.findAndCountAll({
        where: whereStatement
    }).then(function (result) {
        let recordData = result.rows;
        resp.status(200).json({ message: 'Product Lists',status : 1, data: recordData });
        return;
    });
}


//Search Product
/****************
 * () => ProductSearch Fulltext
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
                where: { prod_name: { [Op.like]: cond } }, // conditions
            }).then(function (result) {
                let totalCount = result.count;
                let totalPages = Math.ceil(totalCount / limit);
                let recordData = result.rows;
                resp.status(200).json({ message: 'Product Lists',status : 1, data: recordData, totalRecord:totalCount, totalPage:totalPages, limit: limit });
                return;
            });
    }else{
        productController.getList(req,resp);
    }            
}

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
        resp.status(200).json({ message: 'Product Lists',status : 1, data: recordData, totalRecord:totalCount, totalPage:totalPages, limit: limit });
        return;
    });
}

//--------------- END Functons ----------------------


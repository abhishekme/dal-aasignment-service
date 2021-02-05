'use strict'

var userController = require('../controller/user');
var productController = require('../controller/product');

var authController = require('../controller/auth/authController');
var constants      = require('../../config/constants');
const variableDefined = constants[0].application;
const jwt = require("jsonwebtoken");
const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config.json')[env];

module.exports = function(app) {
//-------------------- AUTH Route ---------------------------------
app.route('/logout')
    .post(userController.authRequired, userController.logout)
app.route('/login')
     .post(userController.validate('login'), userController.login)
//-------------------- AUTH Route ---------------------------------

//-------------------- USER SECTION REST ROUTE ---------------------------------

app.route('/user')
    .get(userController.authRequired, userController.getList)
    .delete(userController.authRequired, userController.delete)
    .post(userController.validate('create'), userController.create)  
app.put('/user', userController.authRequired, userController.validate('update'),userController.update);  //PUT requires a callback, write differently

//Product Route Section
app.route('/product')
    .get(productController.authRequired,  productController.getList)
app.route('/product-search')
    .post(productController.authRequired,  productController.searchList)
//-------------------- DO OTHER SECTION ---------------------------------


};
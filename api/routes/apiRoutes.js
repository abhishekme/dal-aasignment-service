'use strict'

var userController      = require('../controller/user');
var productController   = require('../controller/product');
var orderController     = require('../controller/orders');

var constants           = require('../../config/constants');
const variableDefined   = constants[0].application;
const env               = process.env.NODE_ENV || 'development';
const config            = require('../../config/config.json')[env];

module.exports = function(app) {
//-------------------- AUTH Route ---------------------------------
app.route('/login')
     .post(userController.validate('login'), userController.login)
//-------------------- AUTH Route ---------------------------------

//-------------------- USER SECTION REST ROUTE ---------------------------------

app.route('/user')
    .post(userController.validate('create'), userController.create)  

//Product Route Section
app.route('/product')
    .get(productController.authRequired,  productController.getList)
app.route('/product-search')
    .post(productController.authRequired,  productController.searchList)
app.route('/product-search-by-date')
    .get(productController.authRequired,  productController.searchProduct)

//Order Route Section
app.route('/order')
    .get(orderController.authRequired,  orderController.getList)
    .delete(orderController.authRequired, orderController.delete)
    .post(orderController.authRequired, orderController.validate('create'), orderController.create) 
app.route('/order-search')
    .post(orderController.authRequired,  orderController.searchList)
app.route('/order-sale')
    .get(orderController.authRequired,  orderController.saleOrder)

//-------------------- DO OTHER SECTION ---------------------------------


};
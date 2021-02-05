'use strict'

var crypto     = require('crypto');

module.exports = (sequelize, DataTypes) => {
  
  const Product = sequelize.define('product', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      prod_name: DataTypes.STRING,
      prod_price: DataTypes.DOUBLE(10,2),
      prod_exp_date: DataTypes.DATE
    },
    {
      freezeTableName: true,
    });
 return Product;  
}

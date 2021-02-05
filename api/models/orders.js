'use strict'

module.exports = (sequelize, DataTypes) => {
  
const Orders = sequelize.define('orders', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      prod_id: DataTypes.STRING,
      order_date: DataTypes.DATE,
      order_amount: DataTypes.DOUBLE(10,2),
      order_qty: DataTypes.INTEGER,
    },
    {
      freezeTableName: true,
    });

 return Orders;  
}

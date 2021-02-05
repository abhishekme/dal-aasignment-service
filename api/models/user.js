'use strict'

var crypto                  = require('crypto');

module.exports = (sequelize, DataTypes) => {
  
  const User = sequelize.define('user', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
      },
      first_name: DataTypes.STRING,
      password: DataTypes.STRING,
      salt: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING,
      username: DataTypes.STRING,      
      address: DataTypes.STRING,
      city: DataTypes.STRING,
      profile_pic: DataTypes.TEXT
    },
    {
      freezeTableName: true,
    });

  // checking if password is valid
  User.validPassword = function(passwordHash, userPassword, dbSalt) {
      let salt = dbSalt;//crypto.randomBytes(16).toString('hex');
      var hashUser = crypto.pbkdf2Sync(userPassword, salt, 1000, 64, `sha512`).toString(`hex`); 
      return hashUser === passwordHash; 
 }
 return User; 
}

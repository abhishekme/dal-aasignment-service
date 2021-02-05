'use strict'

const express           = require("express");
const bodyParser        = require("body-parser");
const cors              = require("cors");
var routes              = require('./api/routes/apiRoutes.js'); //importing route
const session           = require('express-session');
const jsonwebtoken      = require("jsonwebtoken");
const env = process.env.NODE_ENV || 'development';
const config = require('./config/config.json')[env];
const app               = express();
var corsOptions = {
    origin: "http://localhost:4200"
  };
//Application session
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Set token headers 
app.use(function(req, res, next) {
    //console.log(">>>> Hedaers API: ", req.headers);
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      jsonwebtoken.verify(req.headers.authorization.split(' ')[1], 'TOKEN!1977', function(err, decode) {
        if (err) req.user = undefined;
        req.user = decode;
        next();
      });
    } else {
      req.user = undefined;
      next();
    }
  });

  //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjQsImVtYWlsIjoic2FwdGFyc2hpQGdtYWlsLmNvbSIsImlhdCI6MTYxMjU1MjU0M30.I1JDDMkHK05fiDFS8crv-JGXCOBSBt-hiLT-0anIuIk

app.use(express.static("app/public"));  //use user upload section
routes(app);

app.listen(8085, () => {
    console.log("App listening on port 8085");
});

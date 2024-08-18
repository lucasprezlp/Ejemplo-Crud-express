const mysql= require('mysql2/promise');
const dbConfig = require('../config/config-db');

const pool = mysql.createPool(dbConfig); // el pool es la mejor forma de trabajar en la conexion
module.exports=pool; // exportamos la conexión
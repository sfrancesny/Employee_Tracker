// connection.js
import mysql from "mysql2";
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'BKCFPV81',
    database: 'retail_db'
});

export { connection };


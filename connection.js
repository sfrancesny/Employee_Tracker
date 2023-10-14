// connection.js
import { createConnection } from "mysql2";
const connection = createConnection({
    host: 'localhost',
    user: 'root',
    password: 'BKCFPV81',
    database: 'retail_db'
});

export { connection };

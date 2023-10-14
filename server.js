// server.js
import express from 'express';
import { connection } from './connection.js';

// creates an instance of express
const app = express();

// port #
const PORT = process.env.PORT || 3001;

// middleware to handle JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//
app.get('/api/departments', (req, res) => {
    connection.query('SELECT * FROM department', (error, results) => {
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        res.json(results);
    });
});

// not found request
app.use((req, res) => {
    res.status(404).end();
});

// starts the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

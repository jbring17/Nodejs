require('dotenv').config();

const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

let app = express();
app.use(bodyParser.json());

//Database connection
let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});



//Authenticate
app.post('/login', (req, res) => {
    const username = req.body.username;
    const user = { name: username };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accessToken: accessToken });
});

//get all voters
app.get('/voters', authenticateToken, (req, res) => {
    console.log(req.user);
    connection.query("SELECT * FROM voters",
    (err, rows) => {
        if (err) {
            console.log(err);
            return;
        }
        res.send(rows);
    })
});

//get a voter
app.get('/voters/:id', authenticateToken, (req, res) => {
    connection.query("SELECT * FROM voters WHERE id = ?", [req.params.id],
    (err, rows) => {
        if (err) {
            console.log(err);
            return;
        }
        res.send(rows);
    })
});

//Delete a voter
app.delete('/voters/:id', authenticateToken, (req, res) => {
    connection.query("DELETE FROM voters WHERE id = ?", [req.params.id],
    (err, rows) => {
        if (err) {
            console.log(err);
            return;
        }
        res.send('Deleted Successfully');
    })
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.listen(3001, ()=>console.log('Express server is running at port 3001'));

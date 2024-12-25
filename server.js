require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/login-app';

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB connection
let db;
MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((client) => {
        db = client.db('login-app');
        console.log('Connected to Database');
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB', error);
    });

// Routes

// Home Page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Login Page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});

// Register Page
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/views/register.html');
});

// Register User
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await db.collection('users').insertOne({ username: req.body.username, password: hashedPassword });
        console.log('User registered:', req.body.username);
        res.redirect('/login');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('An error occurred while registering');
    }
});

// Login User
app.post('/login', async (req, res) => {
    try {
        const user = await db.collection('users').findOne({ username: req.body.username });
        if (user && (await bcrypt.compare(req.body.password, user.password))) {
            console.log('User logged in:', req.body.username);
            res.send('<h1>Login Successful</h1><a href="/">Go to Home</a>');
        } else {
            res.send('<h1>Invalid Credentials</h1><a href="/login">Try Again</a>');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('An error occurred while logging in');
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

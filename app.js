import { config } from 'dotenv';
import express from 'express';
import ConnectToDB from './config/connect.js';

const app = express();

config();

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} - ${req.url}`);
  next();
});

ConnectToDB();

app.get('/', (req, res) => {
  res.render('welcome')
});

app.get('/signup', (req, res) => {
  res.render('register')
});

app.get('/login', (req, res) => {
  res.render('login')
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
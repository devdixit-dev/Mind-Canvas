import 'dotenv/config'
import express from 'express';
import ConnectToDB from './config/connect.js';
import userRouter from './routes/userRoute.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} - ${req.url}`);
  next();
});

ConnectToDB();

app.use('/user', userRouter);

app.get('/', (req, res) => {
  res.render('welcome')
});

app.get('/register', (req, res) => {
  res.render('register')
});

app.get('/login', (req, res) => {
  res.render('login')
});

app.get('/find-user', (req, res) => {
  res.render('find-user');
});

app.get('/verify-otp', (req, res) => {
  res.render('verify-otp');
})

app.get('/change-password', (req, res) => {
  res.render('change-password')
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
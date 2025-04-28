import 'dotenv/config'
import express from 'express';
import ConnectToDB from './config/connect.js';
import userRouter from './routes/userRoute.js';
import cookieParser from 'cookie-parser';

const app = express();

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(cookieParser());
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

app.get('/signup', (req, res) => {
  res.render('register')
});

app.get('/login', (req, res) => {
  res.render('login')
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
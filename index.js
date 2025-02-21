require('dotenv').config();
const connectDB=require('./config/database')
const {express, app, server } = require('./socket/socket');
const cors = require('cors');
const cookieParser = require('cookie-parser');

app.use(cors({ origin: `${process.env.CLIENT_URL}`, credentials: true }));

app.use(cookieParser());
app.use(express.json())

const userRoute = require('./routes/userRoute');
const messageRoute=require('./routes/messageRoute')
app.use('/api/v1/user/', userRoute);
app.use('/api/v1/message/',messageRoute)

app.get('/', (req, res) => {
    res.send("<h1>Hello from Home page</h1>");
});

server.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
});
connectDB()

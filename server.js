const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const indexRouter = require('./router.js');

const app = express();

app.use(express.json());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cors());

app.use('/api', indexRouter);

// 处理错误
app.use((err, req, res, next) => {
    // console.log(err);
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
      message: err.message,
    });
});

app.listen(3000,() => console.log(`服务启动成功：http://localhost:3000`));

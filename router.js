const express = require('express');
const router = express.Router();
const db = require('./dbConnection');
const { signupValidation, loginValidation } = require('./validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'my-secret'

router.post('/register', signupValidation, (req, res, next) => {
  db.query(
    `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(
      req.body.email
    )});`,
    (err, result) => {
      if (result.length) {
        return res.status(409).send({
          msg: '邮箱已被注册'
        });
      } else {
        // 如果可以注册，
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              msg: err
            });
          } else {
            // 密码加密后，存入数据库
            db.query(
              `INSERT INTO users (name, email, password) VALUES ('${req.body.name}', ${db.escape(
                req.body.email
              )}, ${db.escape(hash)})`,
              (err, result) => {
                if (err) {
                  return res.status(400).send({
                    msg: err
                  });
                }
                return res.status(201).send({
                  msg: '用户注册成功'
                });
              }
            );
          }
        });
      }
    }
  );
});

router.post('/login', loginValidation, (req, res, next) => {
  db.query(
    `SELECT * FROM users WHERE email = ${db.escape(req.body.email)};`,
    (err, result) => {
      // 用户不存在
      if (err) {
        // throw err;
        return res.status(400).send({
          msg: err
        });
      }
      if (!result.length) {
        return res.status(401).send({
          msg: '用户名或密码错误'
        });
      }
      // 检查密码是否正确
      bcrypt.compare(
        req.body.password,
        result[0]['password'],
        (bErr, bResult) => {
          // 密码错误
          if (bErr) {
            // throw bErr;
            return res.status(401).send({
              msg: '用户名或密码错误'
            });
          }
          if (bResult) {
            const token = jwt.sign({ id: result[0].id }, JWT_SECRET, { expiresIn: '1h' });
            db.query(
              `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`
            );
            return res.status(200).send({
              msg: '登陆成功',
              token,
              user: result[0]
            });
          }
          return res.status(401).send({
            msg: '用户名或密码错误'
          });
        }
      );
    }
  );
});

router.post('/get-user', signupValidation, (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer') ||
    !req.headers.authorization.split(' ')[1]
  ) {
    return res.status(422).json({
      message: "缺少Token",
    });
  }
  const theToken = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(theToken, JWT_SECRET);
  db.query('SELECT * FROM users where id=?', decoded.id, function (error, results, fields) {
    if (error) throw error;
    return res.send({ error: false, data: results[0], message: '请求成功' });
  });
});

module.exports = router;

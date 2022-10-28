const dotenv = require('dotenv-safe').config({ allowEmptyValues: true, example: './.env.example' });
const htmlToText = require('nodemailer-html-to-text').htmlToText;
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const Config = require('./settings/config.json');
const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const http = require('http');
var fs = require('fs');
const app = express();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: '*' }));

if (process.env.SERVER_PRODUCTION === 'FALSE') {
  TOKEN_EXPIRES = 86400;
  console.warn(`\n=========================================DEVELOPMENT=========================================\n` +
    `| DON'T FORGET TO CHANGE \".env\\SERVER_PRODUCTION\" TO \"TRUE\" BEFORE SUBMITTING TO PRODUCTION |\n` +
    `=============================================================================================\n`);
} else {
  TOKEN_EXPIRES = 3600
}

function verifyJWT(req, res, next) {
  if (!req.headers['x-resource-token']) return res.status(401).send({ message: 'Token Verification Failed' });

  var PublicKey = fs.readFileSync('./settings/public.key', 'utf8');
  jwt.verify(req.headers['x-resource-token'], PublicKey, { algorithm: 'RS256' }, function (err, decoded) {
    if (err) return res.status(500).send({ message: err });
    next();
  });
}

function decodeJWT(token) {
  var PublicKey = fs.readFileSync('./settings/public.key', 'utf8');
  return jwt.decode(token, PublicKey, { algorithm: 'RS256' });
}

app.get(`${Config.PATH}/jwt`, verifyJWT, (req, res, next) => {
  if (!req.headers['x-resource-token']) return res.status(401).send({ message: 'Token Verification Failed' });

  var PublicKey = fs.readFileSync('./settings/public.key', 'utf8');
  const decode = jwt.decode(req.headers['x-resource-token'], PublicKey, { algorithm: 'RS256' }, function (err, decoded) {
    if (err) return res.status(500).send({ message: err });
    else return res.status(200).send({ decoded });
  });

  return res.status(200).send({ decode });
});

app.post(`${Config.PATH}/login`, (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  db.query(`SELECT * FROM collaborator WHERE email = '${req.body.email.toLowerCase()}' AND password = MD5('${req.body.password}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Login`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }

    if (result.length <= 0) {
      db.query(`SELECT * FROM company WHERE email = '${req.body.email.toLowerCase()}' AND password = MD5('${req.body.password}')`, function (err, result, fields) {
        if (err) {
          console.error({ info: `Error Login`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
          return res.status(500).send({ message: 'Server Error' });
        }
        
        if (result.length <= 0) return res.status(401).send({ message: 'Invalid Account' });
        if (result[0]['enabled'] == 'false') return res.status(401).send({ message: 'Disabled Account' });
        
        var id           = result[0]['id'];
        var email        = result[0]['email'];
        var cnpj         = result[0]['cnpj'];
        var name         = result[0]['name'];
        var address      = result[0]['address'];
        var photo        = result[0]['photo'];
        var plan         = result[0]['plan'];
        var payment_type = result[0]['payment_type'];
        var enabled      = result[0]['enabled'];
        var PrivateKey   = fs.readFileSync('./settings/private.key', 'utf8');

        var Token = jwt.sign({ id, email, cnpj, name, address, photo, plan, payment_type, enabled }, PrivateKey, {
          expiresIn: TOKEN_EXPIRES,
          algorithm: 'RS256'
        });

        return res.status(200).send({ message: 'Authenticated', token: Token, data: decodeJWT(Token) });
      });

    } else {
      if (result[0]['enabled'] == 'false') return res.status(401).send({ message: 'Disabled Account' });
      
      var id           = result[0]['id'];
      var email        = result[0]['email'];
      var cpf          = result[0]['cnpj'];
      var name         = result[0]['name'];
      var gender       = result[0]['address'];
      var photo        = result[0]['photo'];
      var role_id      = result[0]['plan'];
      var company_id   = result[0]['payment_type'];
      var enabled      = result[0]['enabled'];
      const permission = JSON.parse(result[0].permission);
      var PrivateKey   = fs.readFileSync('./settings/private.key', 'utf8');

      var Token = jwt.sign({ id, email, cpf, name, gender, photo, role_id, company_id, enabled, permission }, PrivateKey, {
        expiresIn: TOKEN_EXPIRES,
        algorithm: 'RS256'
      });

      return res.status(200).send({ message: 'Authenticated', token: Token });
    }
  });
});

/*-------------------- POST - INSERT --------------------*/

app.post(`${Config.PATH}/register`, (req, res, next) => {
  if (!req.body.email || !req.body.password || !req.body.cnpj || !req.body.name || !req.body.address || !req.body.plan || !req.body.payment_type) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  if (!req.body.photo) {
    var photo = 'https://i.imgur.com/fibx3wL.png';
  } else {
    var photo = req.body.photo;
  }

  db.query(`INSERT INTO company(email, password, cnpj, name, address, photo, plan, payment_type) VALUES ('${req.body.email.toLowerCase()}', MD5('${req.body.password}'), '${req.body.cnpj}', '${req.body.name.toUpperCase()}', '${req.body.address.toUpperCase()}', '${photo}', '${req.body.plan}', '${req.body.payment_type}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Register Company`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }
    
    return res.status(200).send({ message: 'Registered' });
  });
});

app.post(`${Config.PATH}/insert/category`, verifyJWT, (req, res, next) => {
  if (!req.body.name || !req.body.description || !req.body.company_id) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  db.query(`INSERT INTO product_category(name, description, company_id) VALUES ('${req.body.name}', '${req.body.description}', '${req.body.company_id}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Register Category`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }
    
    return res.status(200).send({ message: 'Registered' });
  });
});

app.post(`${Config.PATH}/insert/product`, verifyJWT, (req, res, next) => {
  if (!req.body.name || !req.body.description || !req.body.stock || !req.body.category_id || !req.body.company_id) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  if (!req.body.photo) {
    var photo = 'https://i.imgur.com/fibx3wL.png';
  } else {
    var photo = req.body.photo;
  }

  db.query(`INSERT INTO product(name, description, photo, stock, category_id, company_id) VALUES ('${req.body.name}', '${req.body.description}', '${photo}', '${req.body.stock}', '${req.body.category_id}', '${req.body.company_id}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Register Product`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }
    
    return res.status(200).send({ message: 'Registered' });
  });
});

/*-------------------- GET - LIST --------------------*/

app.get(`${Config.PATH}/list/collaborator`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  db.query(`SELECT collaborator.id, collaborator.email, collaborator.cpf, collaborator.name, collaborator.photo, collaborator.enabled, collaborator.permission, company.name AS comapny_name FROM collaborator LEFT JOIN company ON company.id = collaborator.company_id WHERE collaborator.company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Collaborator List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send(result);
  });
});

app.get(`${Config.PATH}/list/category`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  db.query(`SELECT product_category.*, company.name FROM product_category LEFT JOIN company ON company.id = product_category.company_id WHERE product_category.company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Category List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send(result[0].permission);
  });
});

app.get(`${Config.PATH}/list/product`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  db.query(`SELECT product.*, company.name FROM product LEFT JOIN company ON company.id = product.company_id WHERE product.company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Product List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send(result);
  });
});

/*-------------------- INSERT --------------------*/

app.post(`${Config.PATH}/register/collaborator`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (!req.body.email || !req.body.password || !req.body.cpf || !req.body.name) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  if (!req.body.photo) {
    var photo = 'https://i.imgur.com/fibx3wL.png';
  } else {
    var photo = req.body.photo;
  }

  db.query(`INSERT INTO collaborator(email, password, cpf, name, gender, photo, company_id, enabled, permission) VALUES ('${req.body.email.toLowerCase()}', MD5('${req.body.password}'), '${req.body.cpf}', '${req.body.name.toUpperCase()}', '${req.body.gender}', '${photo}', '${tokenDecoded.company_id ?? tokenDecoded.id}', '${req.body.enabled}', '${JSON.stringify(req.body.permission)}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Register Collaborator`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.code });
    }
    
    return res.status(200).send({ message: 'Registered' });
  });
});

/*-------------------- DELETE --------------------*/

app.post(`${Config.PATH}/delete/collaborator`, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (!req.body.id) return res.status(401).send({ message: 'Invalid Data' });

  db.query(`DELETE FROM collaborator WHERE id = '${req.body.id}' AND company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Collaborator Delete`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send({ message: 'Deleted' });
  });
});

var server = http.createServer(app).listen(process.env.SERVER_PORT);
console.log(`API working on \'${Config.PROTOCOL}${Config.HOST}:${process.env.SERVER_PORT}${Config.PATH}\'\n\n✔ Server API`);
const dotenv = require('dotenv-safe').config({ allowEmptyValues: true, example: './.env.example' });
const htmlToText = require('nodemailer-html-to-text').htmlToText;
const cookieParser = require('cookie-parser');
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
app.use(cors({origin: '*'}));
app.use(cookieParser());

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

app.get(`${Config.PATH}/`, verifyJWT, (req, res, next) => {
  return res.status(200).send({ message: 'Token Authorized' });
});

app.post(`${Config.PATH}/login`, (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  db.query(`SELECT * FROM collaborator WHERE email = '${req.body.email}' AND password = MD5('${req.body.password}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Login`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }

    if (result.length <= 0) {
      db.query(`SELECT * FROM company WHERE email = '${req.body.email}' AND password = MD5('${req.body.password}')`, function (err, result, fields) {
        if (err) {
          console.error({ info: `Error Login`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
          return res.status(500).send({ message: 'Server Error' });
        }
        
        if (result.length <= 0) return res.status(401).send({ message: 'Invalid Account' });
          
        var UserID = result[0]['id'];
        var PrivateKey = fs.readFileSync('./settings/private.key', 'utf8');

        var Token = jwt.sign({ UserID }, PrivateKey, {
          expiresIn: TOKEN_EXPIRES,
          algorithm: 'RS256'
        });

        res.cookie('auth', Token);

        return res.status(200).send({ message: 'Authenticated', token: Token });
      });

    } else {
      var UserID = result[0]['id'];
      var CompanyID = result[0]['company_id'];
      var PrivateKey = fs.readFileSync('./settings/private.key', 'utf8');

      var Token = jwt.sign({ UserID, CompanyID }, PrivateKey, {
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

  db.query(`INSERT INTO company(email, password, cnpj, name, address, photo, plan, payment_type) VALUES ('${req.body.email}', MD5('${req.body.password}'), '${req.body.cnpj}', '${req.body.name}', '${req.body.address}', '${photo}', '${req.body.plan}', '${req.body.payment_type}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Register Company`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }
    
    return res.status(200).send({ message: 'Registered' });
  });
});

app.post(`${Config.PATH}/collaborator`, verifyJWT, (req, res, next) => {
  if (!req.body.email || !req.body.password || !req.body.cpf || !req.body.name || !req.body.role_id || !req.body.company_id) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  if (!req.body.photo) {
    var photo = 'https://i.imgur.com/fibx3wL.png';
  } else {
    var photo = req.body.photo;
  }

  db.query(`INSERT INTO company(email, password, cpf, name, photo, role_id, company_id) VALUES ('${req.body.email}', MD5('${req.body.password}'), '${req.body.cpf}', '${req.body.name}', '${photo}', '${req.body.role_id}', '${req.body.company_id}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Register Collaborator`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }
    
    return res.status(200).send({ message: 'Registered' });
  });
});

app.post(`${Config.PATH}/role`, verifyJWT, (req, res, next) => {
  if (!req.body.name || !req.body.description || !req.body.company_id) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  db.query(`INSERT INTO role(name, description, company_id) VALUES ('${req.body.name}', '${req.body.description}', '${req.body.company_id}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Register Role`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }
    
    return res.status(200).send({ message: 'Registered' });
  });
});

app.post(`${Config.PATH}/permission`, verifyJWT, (req, res, next) => {
  if (!req.body.name || !req.body.description || !req.body.role_id || !req.body.company_id) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  db.query(`INSERT INTO permission(name, description, role_id, company_id) VALUES ('${req.body.name}', '${req.body.description}', '${req.body.role_id}', '${req.body.company_id}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Register Permission`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }
    
    return res.status(200).send({ message: 'Registered' });
  });
});

app.post(`${Config.PATH}/category`, verifyJWT, (req, res, next) => {
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

app.post(`${Config.PATH}/product`, verifyJWT, (req, res, next) => {
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

app.get(`${Config.PATH}/collaborator`, verifyJWT, (req, res, next) => {
  if (!req.body.company_id) return res.status(401).send({ message: 'Invalid Data' });

  db.query(`SELECT collaborator.id, collaborator.email, collaborator.cpf, collaborator.name, collaborator.photo, collaborator.enabled, company.name FROM collaborator LEFT JOIN company ON company.id = collaborator.company_id WHERE collaborator.company_id = '${req.body.company_id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Collaborator List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send(result);
  });
});

app.get(`${Config.PATH}/role`, verifyJWT, (req, res, next) => {
  if (!req.body.company_id) return res.status(401).send({ message: 'Invalid Data' });

  db.query(`SELECT role.*, company.name FROM role LEFT JOIN company ON company.id = role.company_id WHERE role.company_id = '${req.body.company_id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Company List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send(result);
  });
});

app.get(`${Config.PATH}/permission`, verifyJWT, (req, res, next) => {
  if (!req.body.company_id) return res.status(401).send({ message: 'Invalid Data' });

  db.query(`SELECT permission.*, role.name, company.name FROM permission LEFT JOIN role ON role.company_id = permission.company_id LEFT JOIN company ON company.id = permission.company_id WHERE permission.company_id = '${req.body.company_id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Permission List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send(result);
  });
});

app.get(`${Config.PATH}/category`, verifyJWT, (req, res, next) => {
  if (!req.body.company_id) return res.status(401).send({ message: 'Invalid Data' });

  db.query(`SELECT product_category.*, company.name FROM product_category LEFT JOIN company ON company.id = product_category.company_id WHERE product_category.company_id = '${req.body.company_id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Category List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send(result);
  });
});

app.get(`${Config.PATH}/product`, verifyJWT, (req, res, next) => {
  if (!req.body.company_id) return res.status(401).send({ message: 'Invalid Data' });

  db.query(`SELECT product.*, company.name FROM product LEFT JOIN company ON company.id = product.company_id WHERE product.company_id = '${req.body.company_id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Product List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send(result);
  });
});

var server = http.createServer(app).listen(process.env.SERVER_PORT);
console.log(`API working on \'${Config.PROTOCOL}${Config.HOST}:${process.env.SERVER_PORT}${Config.PATH}\'\n\n✔ Server API`);
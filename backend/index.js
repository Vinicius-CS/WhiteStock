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
  TOKEN_EXPIRES = 86400;
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

app.get(`${Config.PATH}/jwt/verify`, verifyJWT, (req, res, next) => {
  if (!req.headers['x-resource-token']) return res.status(401).send({ message: 'Token Verification Failed' });

  var PublicKey = fs.readFileSync('./settings/public.key', 'utf8');
  const decode = jwt.decode(req.headers['x-resource-token'], PublicKey, { algorithm: 'RS256' }, function (err, decoded) {
    if (err) return res.status(500).send({ message: 'Invalid Token' });
    else return res.status(200).send({ message: 'Valid Token' });
  });

  return res.status(200).send();
});

app.get(`${Config.PATH}/jwt/decode`, verifyJWT, (req, res, next) => {
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

  db.query(`SELECT * FROM collaborator WHERE enabled = 'true' AND deleted_at IS NULL AND email = '${req.body.email.toLowerCase()}' AND password = MD5('${req.body.password}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Login`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error' });
    }

    if (result.length <= 0) {
      db.query(`SELECT * FROM company WHERE enabled = 'true' AND deleted_at IS NULL AND email = '${req.body.email.toLowerCase()}' AND password = MD5('${req.body.password}')`, function (err, result, fields) {
        if (err) {
          console.error({ info: `Error Login`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
          return res.status(500).send({ message: 'Server Error' });
        }
        
        if (result.length <= 0) return res.status(401).send({ message: 'Invalid Account' });
        if (result[0]['enabled'] == 'false') return res.status(401).send({ message: 'Disabled Account' });
        
        var id            = result[0]['id'];
        var name          = result[0]['name'];
        var email         = result[0]['email'];
        var cnpj          = result[0]['cnpj'];
        var address       = result[0]['address'];
        var photo         = result[0]['photo'];
        var plan          = result[0]['plan'];
        var payment_type  = result[0]['payment_type'];
        var PrivateKey    = fs.readFileSync('./settings/private.key', 'utf8');

        var Token = jwt.sign({ id, name, email, cnpj, address, photo, plan, payment_type, enabled }, PrivateKey, {
          expiresIn: TOKEN_EXPIRES,
          algorithm: 'RS256'
        });

        return res.status(200).send({ message: 'Authenticated', token: Token, data: decodeJWT(Token) });
      });

    } else {
      if (result[0]['enabled'] == 'false') return res.status(401).send({ message: 'Disabled Account' });
      
      var id            = result[0]['id'];
      var name          = result[0]['name'];
      var email         = result[0]['email'];
      var cpf           = result[0]['cnpj'];
      var gender        = result[0]['address'];
      var photo         = result[0]['photo'];
      var company_id    = result[0]['company_id'];
      var enabled       = result[0]['enabled'];
      const permission  = JSON.parse(result[0].permission);
      var PrivateKey    = fs.readFileSync('./settings/private.key', 'utf8');

      var Token = jwt.sign({ id, name, email, cpf, gender, photo, company_id, enabled, permission }, PrivateKey, {
        expiresIn: TOKEN_EXPIRES,
        algorithm: 'RS256'
      });

      return res.status(200).send({ message: 'Authenticated', token: Token });
    }
  });
});

/*-------------------- POST - INSERT --------------------*/

app.post(`${Config.PATH}/register`, (req, res, next) => {
  if (!req.body.name || !req.body.email || !req.body.password || !req.body.cnpj || !req.body.address || !req.body.plan || !req.body.payment_type) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  if (!req.body.photo) {
    var photo = 'https://i.imgur.com/fibx3wL.png';
  } else {
    var photo = req.body.photo;
  }

  db.query(`INSERT INTO company(name, email, password, cnpj, address, photo, plan, payment_type) VALUES ('${req.body.name.toUpperCase()}', '${req.body.email.toLowerCase()}', MD5('${req.body.password}'), '${req.body.cnpj}', '${req.body.address.toUpperCase()}', '${photo}', '${req.body.plan}', '${req.body.payment_type}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Register Company`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }
    
    return res.status(200).send({ message: 'Registered' });
  });
});

/*-------------------- GET - LIST --------------------*/

app.get(`${Config.PATH}/list/collaborator`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  db.query(`SELECT collaborator.id, collaborator.name, collaborator.email, collaborator.cpf, collaborator.gender, collaborator.photo, collaborator.enabled, collaborator.permission, company.name AS company_name FROM collaborator LEFT JOIN company ON company.id = collaborator.company_id WHERE collaborator.company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}' AND collaborator.deleted_at IS NULL`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Collaborator List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send(result);
  });
});

app.get(`${Config.PATH}/list/category`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  db.query(`SELECT product_category.*, company.name AS company_name FROM product_category LEFT JOIN company ON company.id = product_category.company_id WHERE product_category.company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}' AND product_category.deleted_at IS NULL`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Category List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send(result);
  });
});

app.get(`${Config.PATH}/list/product`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  db.query(`SELECT product.*, product_category.name AS category_name, company.name AS company_name FROM product LEFT JOIN product_category ON product_category.id = product.category_id LEFT JOIN company ON company.id = product.company_id WHERE product.company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}' AND product.deleted_at IS NULL`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Product List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send(result);
  });
});

app.get(`${Config.PATH}/list/company`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  db.query(`SELECT id, name, email, cnpj, address, photo, plan, payment_type, enabled FROM company WHERE id = '${tokenDecoded.company_id ?? tokenDecoded.id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Company List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }

    if (result.length <= 0) return res.status(204).send();

    return res.status(200).send(result);
  });
});

/*-------------------- GET - CHART --------------------*/

app.get(`${Config.PATH}/chart/product`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  db.query(`SELECT product.name, product_output.amount FROM product LEFT JOIN product_output ON product_output.product_id = product.id WHERE product.company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}' AND product.enabled = 'true' AND product.deleted_at IS NULL ORDER BY product.id ASC, product_output.amount ASC LIMIT 6`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Product List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send(result);
  });
});

/*-------------------- INSERT --------------------*/

app.post(`${Config.PATH}/insert/collaborator`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (!req.body.name || !req.body.email || !req.body.password || !req.body.cpf || !req.body.gender || !req.body.enabled) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  if (!req.body.photo) {
    var photo = 'https://i.imgur.com/fibx3wL.png';
  } else {
    var photo = req.body.photo;
  }

  db.query(`INSERT INTO collaborator(name, email, password, cpf, gender, photo, company_id, enabled, permission) VALUES ('${req.body.name.toUpperCase()}', '${req.body.email.toLowerCase()}', MD5('${req.body.password}'), '${req.body.cpf}', '${req.body.gender}', '${photo}', '${tokenDecoded.company_id ?? tokenDecoded.id}', '${req.body.enabled}', '${JSON.stringify(req.body.permission)}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Register Collaborator`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', data: errorHandlingSQL(err.errno, req.originalUrl, 'e-mail ou CNPJ') });
    }
    
    return res.status(200).send({ message: 'Registered' });
  });
});

app.post(`${Config.PATH}/insert/category`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (!req.body.name || !req.body.description || !req.body.enabled) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  var description = req.body.description;

  while (description.match(/\s$/) != null && description.match(/\s$/).length > 0) {
    description = description.replace(/\s$/, '')
  }

  db.query(`INSERT INTO product_category(name, description, company_id, enabled) VALUES ('${req.body.name.toUpperCase()}', '${description}', '${tokenDecoded.company_id ?? tokenDecoded.id}', '${req.body.enabled}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Insert Category`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }
    
    return res.status(200).send({ message: 'Inserted' });
  });
});

app.post(`${Config.PATH}/insert/product`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (!req.body.name || !req.body.description || !req.body.category || !req.body.enabled) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  if (!req.body.photo) {
    var photo = 'https://i.imgur.com/fibx3wL.png';
  } else {
    var photo = req.body.photo;
  }

  db.query(`INSERT INTO product(name, description, photo, category_id, company_id, enabled) VALUES ('${req.body.name.toUpperCase()}', '${req.body.description}', '${photo}', '${req.body.category}', '${tokenDecoded.company_id ?? tokenDecoded.id}', '${req.body.enabled}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Insert Product`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }
    
    return res.status(200).send({ message: 'Inserted' });
  });
});

/*-------------------- UPDATE --------------------*/

app.post(`${Config.PATH}/update/collaborator`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (!req.body.id || !req.body.name || !req.body.email || !req.body.cpf || !req.body.gender || !req.body.enabled) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  db.query(`UPDATE collaborator SET name = '${req.body.name.toUpperCase()}', email = '${req.body.email.toLowerCase()}', ${req.body.password != undefined ? "password = MD5('" + req.body.password + "'), " : ''}cpf = '${req.body.cpf}', gender = '${req.body.gender}', enabled = '${req.body.enabled}', permission = '${JSON.stringify(req.body.permission)}' WHERE company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}' AND id = ${req.body.id}`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Update Collaborator`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }
    
    return res.status(200).send({ message: 'Updated' });
  });
});

app.post(`${Config.PATH}/update/category`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (!req.body.id || !req.body.name || !req.body.description || !req.body.enabled) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  var description = req.body.description;

  while (description.match(/\s$/) != null && description.match(/\s$/).length > 0) {
    description = description.replace(/\s$/, '')
  }

  db.query(`UPDATE product_category SET name = '${req.body.name.toUpperCase()}', description = '${description}', enabled = '${req.body.enabled}' WHERE company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}' AND id = ${req.body.id}`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Update Category`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }
    
    return res.status(200).send({ message: 'Updated' });
  });
});

app.post(`${Config.PATH}/update/product`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (!req.body.id || !req.body.name || !req.body.description || !req.body.stock || !req.body.category || !req.body.enabled) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  var description = req.body.description;

  while (description.match(/\s$/) != null && description.match(/\s$/).length > 0) {
    description = description.replace(/\s$/, '')
  }

  db.query(`UPDATE product SET name = '${req.body.name.toUpperCase()}', description = '${description}', stock = '${req.body.stock}', category_id = '${req.body.category}', enabled = '${req.body.enabled}' WHERE company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}' AND id = ${req.body.id}`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Update Product`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }
    
    return res.status(200).send({ message: 'Updated' });
  });
});

app.post(`${Config.PATH}/update/company`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (!req.body.name || !req.body.address || !req.body.cnpj) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  db.query(`UPDATE company SET name = '${req.body.name.toUpperCase()}', address = '${req.body.address.toUpperCase()}', cnpj = '${req.body.cnpj}' WHERE id = '${tokenDecoded.company_id ?? tokenDecoded.id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Update Company`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }
    
    return res.status(200).send({ message: 'Updated' });
  });
});

/*-------------------- DELETE --------------------*/

app.post(`${Config.PATH}/delete/collaborator`, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (!req.body.id) return res.status(401).send({ message: 'Invalid Data' });

  db.query(`DELETE FROM collaborator WHERE id = '${req.body.id}' AND company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Delete Collaborator`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send({ message: 'Deleted' });
  });
});

app.post(`${Config.PATH}/delete/category`, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (!req.body.id) return res.status(401).send({ message: 'Invalid Data' });

  db.query(`DELETE FROM product_category WHERE id = '${req.body.id}' AND company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Delete Category`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send({ message: 'Deleted' });
  });
});

app.post(`${Config.PATH}/delete/product`, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (!req.body.id) return res.status(401).send({ message: 'Invalid Data' });

  db.query(`DELETE FROM product WHERE id = '${req.body.id}' AND company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Delete Product`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }

    if (result.length <= 0) return res.status(204).send();
    return res.status(200).send({ message: 'Deleted' });
  });
});

var server = http.createServer(app).listen(process.env.SERVER_PORT);
console.log(`API working on \'${Config.PROTOCOL}${Config.HOST}:${process.env.SERVER_PORT}${Config.PATH}\'\n\n✔ Server API`);
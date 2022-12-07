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

  db.query(`SELECT collaborator.*, company.name as company_name FROM collaborator LEFT JOIN company ON company.id = collaborator.company_id WHERE collaborator.enabled = 'true' AND collaborator.deleted_at IS NULL AND collaborator.email = '${req.body.email.toLowerCase()}' AND collaborator.password = MD5('${req.body.password}')`, function (err, result, fields) {
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
      var gender        = result[0]['gender'];
      var email         = result[0]['email'];
      var cpf           = result[0]['cnpj'];
      var address       = result[0]['address'];
      var photo         = result[0]['photo'];
      var company_id    = result[0]['company_id'];
      var company_name  = result[0]['company_name'];
      var enabled       = result[0]['enabled'];
      const permission  = JSON.parse(result[0].permission);
      var PrivateKey    = fs.readFileSync('./settings/private.key', 'utf8');

      var Token = jwt.sign({ id, name, gender, address, email, cpf, photo, company_id, company_name, enabled, permission }, PrivateKey, {
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

  db.query(`INSERT INTO company(name, email, password, cnpj, address, photo, plan, payment_type) VALUES ('${req.body.name.toUpperCase()}', '${req.body.email.toLowerCase()}', MD5('${req.body.password}'), '${req.body.cnpj}', '${req.body.address.toUpperCase()}', '${photo}', '${req.body.plan}', '${req.body.payment_type.toLowerCase()}')`, function (err, result, fields) {
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

  db.query(`SELECT id, name, email, cpf, gender, photo, enabled, permission FROM collaborator WHERE company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}' AND deleted_at IS NULL`, function (err, result, fields) {
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

  db.query(`SELECT * FROM product_category WHERE company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}' AND deleted_at IS NULL`, function (err, result, fields) {
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

  db.query(`SELECT product.*, product_category.name AS category_name, IFNULL(order_amount, 0) AS order_amount, IFNULL(output_amount, 0) AS output_amount, (IFNULL(order_amount, 0) - IFNULL(output_amount, 0)) AS product_amount FROM product LEFT JOIN product_category ON product_category.id = product.category_id LEFT JOIN (SELECT product_id, SUM(amount) as order_amount FROM product_order WHERE deleted_at IS NULL GROUP BY product_id) AS product_order ON product_order.product_id = product.id LEFT JOIN (SELECT product_id, SUM(amount) as output_amount FROM product_output GROUP BY product_id) AS product_output ON product_output.product_id = product.id WHERE product.company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}' AND product.deleted_at IS NULL`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Product List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }

    if (result.length <= 0) return res.status(204).send();

    for (let i = 0; i < result.length; i++) {
      db.query(`SELECT id, amount, delivered_at, created_at FROM product_order WHERE product_id = '${result[i].id}' AND company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}' AND deleted_at IS NULL`, function (err, result_order, fields) {
        if (err) {
          console.error({ info: `Error Product List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
          return res.status(500).send({ message: 'Server Error', code: err.errno });
        }
    
        result[i]['product_order'] = result_order;

        if (i == result.length - 1) {
          if (result.length <= 0) return res.status(204).send();
          return res.status(200).send(result);
        }
      });
    }
  });
});

/*-------------------- GET - DATA --------------------*/

app.get(`${Config.PATH}/data/collaborator`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  db.query(`SELECT id, name, email, cpf, gender, photo, company_id, enabled FROM collaborator WHERE id = '${tokenDecoded.id}' AND company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Company Data`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }

    if (result.length <= 0) return res.status(204).send();

    return res.status(200).send(result[0]);
  });
});

app.get(`${Config.PATH}/data/company`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  db.query(`SELECT id, name, email, cnpj, address, photo, plan, payment_type, enabled FROM company WHERE id = '${tokenDecoded.company_id ?? tokenDecoded.id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Company Data`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }

    if (result.length <= 0) return res.status(204).send();

    return res.status(200).send(result[0]);
  });
});

/*-------------------- GET - CHART --------------------*/

app.get(`${Config.PATH}/chart/product`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  db.query(`SELECT id, name, IFNULL(order_amount, 0) AS order_amount, IFNULL(output_amount, 0) AS output_amount, (IFNULL(order_amount, 0) - IFNULL(output_amount, 0)) as product_amount FROM product LEFT JOIN (SELECT product_id, SUM(amount) as order_amount FROM product_order WHERE deleted_at IS NULL GROUP BY product_id) AS product_order ON product_order.product_id = product.id LEFT JOIN (SELECT product_id, SUM(amount) as output_amount FROM product_output GROUP BY product_id) AS product_output ON product_output.product_id = product.id WHERE product.company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}' ORDER BY product.id ASC LIMIT 6`, function (err, lowStock, fields) {
    if (err) {
      console.error({ info: `Error Chart List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }

    db.query(`SELECT product.id, product.name, IFNULL(SUM(product_order.amount), 0) AS product_amount FROM product_order LEFT JOIN product ON product.id = product_order.product_id WHERE product.company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}' AND product_order.delivered_at IS NULL AND product_order.deleted_at IS NULL GROUP BY product_order.product_id ORDER BY product_order.updated_at LIMIT 6`, function (err, orderProduct, fields) {
      if (err) {
        console.error({ info: `Error Chart List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
        return res.status(500).send({ message: 'Server Error', code: err.errno });
      }

      db.query(`SELECT product.id, product.name, IFNULL(SUM(product_output.amount), 0) AS product_amount FROM product_output LEFT JOIN product ON product.id = product_output.product_id WHERE product.company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}' GROUP BY product_output.product_id ORDER BY product_output.bought_at LIMIT 6`, function (err, outputProduct, fields) {
        if (err) {
          console.error({ info: `Error Chart List`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
          return res.status(500).send({ message: 'Server Error', code: err.errno });
        }
    
        return res.status(200).send({LowStock: lowStock, OrderProduct: orderProduct, OutputProduct: outputProduct});
      });
    });
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

  db.query(`INSERT INTO collaborator(name, email, password, cpf, gender, photo, company_id, enabled, permission) VALUES ('${req.body.name.toUpperCase()}', '${req.body.email.toLowerCase()}', MD5('${req.body.password}'), '${req.body.cpf}', '${req.body.gender.toLowerCase()}', '${photo}', '${tokenDecoded.company_id ?? tokenDecoded.id}', '${req.body.enabled.toLowerCase()}', '${JSON.stringify(req.body.permission)}')`, function (err, result, fields) {
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

  db.query(`INSERT INTO product_category(name, description, company_id, enabled) VALUES ('${req.body.name.toUpperCase()}', '${description}', '${tokenDecoded.company_id ?? tokenDecoded.id}', '${req.body.enabled.toLowerCase()}')`, function (err, result, fields) {
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

  db.query(`INSERT INTO product(name, description, photo, category_id, company_id, enabled) VALUES ('${req.body.name.toUpperCase()}', '${req.body.description}', '${photo}', '${req.body.category}', '${tokenDecoded.company_id ?? tokenDecoded.id}', '${req.body.enabled.toLowerCase()}')`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Insert Product`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }
    
    return res.status(200).send({ message: 'Inserted' });
  });
});

app.post(`${Config.PATH}/insert/product/stock`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (!req.body.id || !req.body.stock) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  if (req.body.stock > 0) {
    db.query(`INSERT INTO product_order(amount, product_id, company_id) VALUES ('${req.body.stock.replace(/\D/gm, '')}', '${req.body.id}', '${tokenDecoded.company_id ?? tokenDecoded.id}')`, function (err, result, fields) {
      if (err) {
        console.error({ info: `Error Insert Product`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
        return res.status(500).send({ message: 'Server Error', code: err.errno });
      }
      
      return res.status(200).send({ message: 'Inserted' });
    });

  } else if (req.body.stock < 0) {
    db.query(`INSERT INTO product_output(amount,product_id, company_id) VALUES ('${req.body.stock.replace(/\D/gm, '')}', '${req.body.id}', '${tokenDecoded.company_id ?? tokenDecoded.id}')`, function (err, result, fields) {
      if (err) {
        console.error({ info: `Error Remove Product`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
        return res.status(500).send({ message: 'Server Error', code: err.errno });
      }
      
      return res.status(200).send({ message: 'Removed' });
    });
  }
});

/*-------------------- UPDATE --------------------*/

app.post(`${Config.PATH}/update/company`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (req.body.name == undefined && req.body.email == undefined && req.body.password == undefined && req.body.cnpj == undefined && req.body.address == undefined && req.body.photo == undefined && req.body.plan == undefined && req.body.payment_type == undefined && req.body.enabled == undefined) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  const fields = [];
  if (req.body.name != undefined) fields.push(`name = '${req.body.name.toUpperCase()}'`);
  if (req.body.email != undefined) fields.push(`email = '${req.body.email.toLowerCase()}'`);
  if (req.body.password != undefined) fields.push(`password = MD5('${req.body.password}')`);
  if (req.body.cnpj != undefined) fields.push(`cnpj = '${req.body.cnpj}'`);
  if (req.body.address) fields.push(`address = '${req.body.address.toUpperCase()}'`);
  if (req.body.photo != undefined) fields.push(`photo = '${req.body.photo}'`);
  if (req.body.plan != undefined) fields.push(`plan = '${req.body.plan}'`);
  if (req.body.payment_type != undefined) fields.push(`payment_type = '${req.body.payment_type.toLowerCase()}'`);
  if (req.body.enabled != undefined) fields.push(`enabled = '${req.body.enabled.toLowerCase()}'`);

  db.query(`UPDATE company SET ${fields.join(', ')} WHERE id = '${tokenDecoded.company_id ?? tokenDecoded.id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Update Company`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }
    
    return res.status(200).send({ message: 'Updated' });
  });
});

app.post(`${Config.PATH}/update/collaborator`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (req.body.name == undefined && req.body.email == undefined && req.body.password == undefined && req.body.cpf == undefined && req.body.gender == undefined && req.body.photo == undefined && req.body.enabled == undefined && req.body.permission == undefined) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  const fields = [];
  if (req.body.name != undefined) fields.push(`name = '${req.body.name.toUpperCase()}'`);
  if (req.body.email != undefined) fields.push(`email = '${req.body.email.toLowerCase()}'`);
  if (req.body.password != undefined) fields.push(`password = MD5('${req.body.password}')`);
  if (req.body.cpf != undefined) fields.push(`cpf = '${req.body.cpf}'`);
  if (req.body.gender) fields.push(`gender = '${req.body.gender.toLowerCase()}'`);
  if (req.body.photo != undefined) fields.push(`photo = '${req.body.photo}'`);
  if (req.body.enabled != undefined) fields.push(`enabled = '${req.body.enabled.toLowerCase()}'`);
  if (req.body.permission != undefined) fields.push(`permission = '${JSON.stringify(req.body.permission)}'`);

  db.query(`UPDATE collaborator SET ${fields.join(', ')} WHERE id = '${req.body.id ?? tokenDecoded.id}' AND company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Update Collaborator`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }
    
    return res.status(200).send({ message: 'Updated' });
  });
});

app.post(`${Config.PATH}/update/category`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (req.body.id == undefined || (req.body.name == undefined && req.body.description == undefined && req.body.enabled == undefined)) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  var description = req.body.description;

  while (description.match(/\s$/) != null && description.match(/\s$/).length > 0) {
    description = description.replace(/\s$/, '')
  }

  const fields = [];
  if (req.body.name != undefined) fields.push(`name = '${req.body.name.toUpperCase()}'`);
  if (description != undefined) fields.push(`description = '${description}'`);
  if (req.body.enabled != undefined) fields.push(`enabled = '${req.body.enabled.toLowerCase()}'`);

  db.query(`UPDATE product_category SET ${fields.join(', ')} WHERE id = '${req.body.id}' AND company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Update Category`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
      return res.status(500).send({ message: 'Server Error', code: err.errno });
    }
    
    return res.status(200).send({ message: 'Updated' });
  });
});

app.post(`${Config.PATH}/update/product`, verifyJWT, (req, res, next) => {
  const tokenDecoded = decodeJWT(req.headers['x-resource-token']);

  if (req.body.id == undefined || (req.body.name == undefined && req.body.description == undefined && req.body.photo == undefined && req.body.category_id == undefined && req.body.enabled == undefined)) {
    return res.status(401).send({ message: 'Invalid Data' });
  }

  var description = req.body.description;

  while (description.match(/\s$/) != null && description.match(/\s$/).length > 0) {
    description = description.replace(/\s$/, '')
  }

  const fields = [];
  if (req.body.name != undefined) fields.push(`name = '${req.body.name.toUpperCase()}'`);
  if (description != undefined) fields.push(`description = '${description}'`);
  if (req.body.photo != undefined) fields.push(`photo = '${req.body.photo}'`);
  if (req.body.category_id != undefined) fields.push(`category_id = '${req.body.category_id}'`);
  if (req.body.enabled != undefined) fields.push(`enabled = '${req.body.enabled.toLowerCase()}'`);

  db.query(`UPDATE product SET ${fields.join(', ')} WHERE id = '${req.body.id}' AND company_id = '${tokenDecoded.company_id ?? tokenDecoded.id}'`, function (err, result, fields) {
    if (err) {
      console.error({ info: `Error Update Product`, route: req.protocol + '://' + req.get('host') + req.originalUrl, error: err });
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
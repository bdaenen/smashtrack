var express = require('express');
var router = express.Router();
var clone = require('lodash/cloneDeep');
let dam = require('../db/dataAccessManager');
const dbPool = require('../db/db');
const userAddFormConfig = {
  'username': {
    type: 'text',
    required: true,
    label: 'Smash tag',
    value: ''
  },
  'password': {
    type: 'password',
    required: true,
    label: 'Password',
    value: ''
  },
  'password_confirmation': {
    type: 'password',
    required: true,
    label: 'Password confirmation',
    value: ''
  }
};

/* GET users listing. */
router.get('/', function(req, res, next) {
  let pageSize = Math.abs(parseInt(req.query.pageSize) || 50);
  let page = Math.abs(parseInt(req.query.page, 10) || 1);
    res.json(dam.users.order('id').page(pageSize, page));
});

router.get('/:userId', function(req, res, next) {
  res.json(dam.users.filter({id: parseInt(req.params.userId, 10)}));
});

router.post('/add', function(req, res, next) {
  let data = req.body;
  let errors = validatePostData(userAddFormConfig, data);

  if (!errors.length) {
    let bcrypt = require('bcrypt');
    bcrypt.hash(data.password, 12, function(error, hash) {
      if (error) {
        throw error;
      }

      dbPool.query('INSERT INTO user(tag, password) VALUES (?, ?)', [data.username, hash], function (error, results, fields) {
        if (error) throw error;
      });
      res.json({success: true});
    });
  }
  else {
    res.json({success: false, errors: errors});
  }
});

/**
 * @param formConfig
 * @param data
 * @returns {Array}
 */
function validatePostData(formConfig, data) {
  const { check, validationResult } = require('express-validator/check');
  let errors = [];
  Object.keys(userAddFormConfig).forEach(function(key){
    if (userAddFormConfig[key].required && !data[key]) {
      errors.push({'param': key, msg: 'required'});
    }
    if (key.endsWith('_confirmation')) {
      let matchingKey = key.substr(0, key.lastIndexOf('_confirmation'));
      if (data[key] !== data[matchingKey]) {
        errors.push({param: key, param2: matchingKey, msg: 'parameters should match.'});
      }
    }
  });

  return errors;
}

module.exports = router;

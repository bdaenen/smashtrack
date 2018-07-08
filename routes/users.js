var express = require('express');
var router = express.Router();
var clone = require('lodash/cloneDeep');
const dbPool = require('../db');
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
  dbPool.query('SELECT * FROM user', function(err, results){
    res.render('users/list', { title: 'User list', users: results });
  });
});

router.get('/add', function(req, res, next) {
  res.render('users/add', { title: 'Add a user', formConfig: userAddFormConfig });
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
      res.render('basic', { title: 'User successfully added!'});
    });
  }
  else {
    let userAddFormConfigModified = fillFormConfigWithData(userAddFormConfig, data);
    res.render('users/add', { title: 'Add a user', formConfig: userAddFormConfigModified, errors: errors })
  }
});

/**
 * @param formConfig
 * @param data
 * @returns {*}
 */
function fillFormConfigWithData(formConfig, data) {
  let newObj = clone(formConfig);
  Object.keys(data).forEach(function(key) {
    if (newObj[key]) {
      newObj[key].value = data[key];
    }
  });

  return newObj;
}

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
  });

  return errors;
}

module.exports = router;

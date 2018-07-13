module.exports = function(res, formConfig, callback) {
  res.render('form', {formConfig: formConfig, layout: false}, function(err, html){
    callback(err, html)
  });
};

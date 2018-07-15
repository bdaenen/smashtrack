let DbSet = function(results, total) {
  this.dataset = results || [];
  this.count = this.dataset.length;
  this.total = total || this.dataset.length;
};

const _ = require('lodash');

DbSet.prototype.COMPARE_OR = 1;
DbSet.prototype.COMPARE_AND = 2;

DbSet.prototype.COMPARISON_LESSER_THAN = 1;
DbSet.prototype.COMPARISON_GREATER_THAN = 2;
DbSet.prototype.COMPARISON_EQUALS = 4;
DbSet.prototype.COMPARISON_LESSER_THAN_EQUAL = 5;
DbSet.prototype.COMPARISON_GREATER_THAN_EQUAL = 6;
DbSet.prototype.COMPARISON_CONTAINS = 8;

DbSet.prototype.filter = function(filterParams, comparison) {
  comparison = comparison || this.COMPARE_OR;
  let results = this.dataset.filter(function(row){
    let fieldFilters = Object.keys(filterParams);
    for (let i = 0; i < fieldFilters.length; i++) {
      let filterProp = fieldFilters[i];
      let filterRule = filterParams[filterProp];
      let ruleMatches = this.evaluateFilterRule(row, filterProp, filterRule);

      if (comparison === this.COMPARE_OR && ruleMatches) {
        return true;
      }

      if (comparison === this.COMPARE_AND && !ruleMatches) {
        return false;
      }
    }
  }, this);

  return new this.constructor(results, this.total);
};

DbSet.prototype.order = function(orderFields, directions) {
  return new this.constructor(_.orderBy(this.dataset, orderFields, directions), this.total);
};

DbSet.prototype.page = function(pageSize, page) {
  let start = (page-1)*pageSize;
  let stop = start + pageSize;
  return new this.constructor(this.dataset.slice(start, stop), this.total);
};

/**
 *
 */
DbSet.prototype.evaluateFilterRule = function(row, filterProp, filterRule) {
  let compareValue;
  let comparison;
  let rowValue = row[filterProp];

  if (typeof filterRule === 'object') {
    compareValue = filterRule.value;
    comparison = filterRule.comparison;
  }
  else {
    compareValue = filterRule;
    comparison = this.COMPARISON_EQUALS;
  }

  switch (comparison) {
    case this.COMPARISON_LESSER_THAN:
      return this.valueLesserThan(rowValue, compareValue);
      break;
    case this.COMPARISON_GREATER_THAN:
      return this.valueGreaterThan(rowValue, compareValue);
      break;
    case this.COMPARISON_EQUALS:
      return this.valueEquals(rowValue, compareValue)
      break;
    case this.COMPARISON_LESSER_THAN_EQUAL:
      return this.valueLesserThan(rowValue, compareValue) || this.valueEquals(rowValue, compareValue);
      break;
    case this.COMPARISON_GREATER_THAN_EQUAL:
      return this.valueGreaterThan(rowValue, compareValue) || this.valueEquals(rowValue, compareValue);
      break;
    case this.COMPARISON_CONTAINS:
      return this.valueContains(rowValue, compareValue);
      break;
  }
};

DbSet.prototype.valueLesserThan = function(value1, value2) {
  return value1 < value2;
};

DbSet.prototype.valueGreaterThan = function(value1, value2) {
  return value1 > value2;
};

DbSet.prototype.valueEquals = function(value1, value2) {
  return value1 == value2;
};

DbSet.prototype.valueContains = function(value1, value2) {
  if (typeof value1 === 'string' || value1 instanceof String) {
    //return value1.includes(value2);
    return value1.indexOf(value2) !== -1;
  }
  if (Array.isArray(value1)) {
    return value1.indexOf(value2) !== -1;
  }
};

DbSet.prototype.forEach = function(cb, ctx) {
  return this.dataset.forEach(cb, ctx);
};

DbSet.prototype.toJSON = function() {
  return {
    data: this.dataset,
    count: this.count,
    total: this.total
  }
};

DbSet.prototype.toString = function() {
  return this.dataset.toString();
};

module.exports = DbSet;

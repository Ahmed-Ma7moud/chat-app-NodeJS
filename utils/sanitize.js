const xss = require('xss');

//const options = { whiteList: {} }; to block all tags like <b> , <i>
// xss(value.trim(), options)
function sanitize(value) {

  if (typeof value === 'string') {
    return xss(value.trim());
  }
  else if (Array.isArray(value)) {
    return value.map(item => sanitize(item));
  }
  else if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, sanitize(v)])
    );
  }
  return value; // Return as is if not a string, array, or object
}

module.exports = sanitize;
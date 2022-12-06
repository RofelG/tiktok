var con = require('../config/database');

module.exports = {
  getUser: async(req, res) => {
    let query = 'SELECT user_id, user_first, user_last, user_email, user_password, user_salt FROM user WHERE user_email = ? AND user_status = 1 LIMIT 1';
    const [user] = await con.query(query, req).catch(err => { throw err} );
    return (user === undefined ? undefined : JSON.parse(JSON.stringify(user)));
  },
  createUser: async(req, res) => {
    let query = 'INSERT INTO user (user_first, user_last, user_email, user_password, user_salt) VALUES (?, ?, ?, ?, ?)';
    const user = await con.query(query, req).catch(err => { throw err} );
    return user.insertId;
  },
  changePassword: async(req, res) => {
    let query = 'UPDATE user SET user_password = ?, user_salt = ? WHERE user_id = ?';
    const user = await con.query(query, req).catch(err => { throw err} );
    return user;
  },
  postUserNames: async(req, res) => {
    let query = 'SELECT user_id, user_first, user_last, user_email FROM user WHERE 1=1 AND ' 
    let body = req;

    let params = [];
    if (body.length == 0) return {};

    for(let i = 0; i < body.length; i++) {
      if (i > 0) query += ' OR ';
      query += 'user_id = ?';
      params.push(body[i]);
    }
    const user = await con.query(query, req).catch(err => { throw err} );
    return (user === undefined ? undefined : JSON.parse(JSON.stringify(user)));
  }
}
var express = require('express');
var router = express.Router();

let landing = require('../controllers/landing');
let user = require('../controllers/user');


// for login/signup auth system
router.get('/login', user.show_login);
router.get('/signup', user.show_signup);
router.post('/login', user.login);
router.post('/signup', user.signup);
router.post('/logout', user.logout);
router.get('/logout', user.logout);

let {isLoggedIn, hasAuth} = require('../middleware/hasAuth.js');
/* GET home page. */
router.get('/', landing.get_landing);
router.post('/', landing.submit_lead);
router.get('/leads', hasAuth, landing.show_leads);
router.get('/lead/:lead_id', hasAuth, landing.show_lead);
// for purpose of editing form for lead_id
router.get('/lead/:lead_id/edit', hasAuth, landing.show_edit_lead);
// for submitting form for lead_id
router.post('/lead/:lead_id/edit', hasAuth, landing.edit_lead);
router.post('/lead/:lead_id/delete', hasAuth, landing.delete_lead);
router.post('/lead/:lead_id/delete-json', hasAuth, landing.delete_lead_json)

module.exports = router;

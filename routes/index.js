var express = require('express');
var router = express.Router();

let landing = require('../controllers/landing');

/* GET home page. */
router.get('/', landing.get_landing);
router.post('/', landing.submit_lead);
router.get('/leads', landing.show_leads);
router.get('/lead/:lead_id', landing.show_lead);
// for purpose of editing form for lead_id
router.get('/lead/:lead_id/edit', landing.show_edit_lead);
// for submitting form for lead_id
router.post('/lead/:lead_id/edit', landing.edit_lead);

module.exports = router;

//jshint esversion:10

const express = require('express');
const router = express.Router();
const admin = require('../controller/admin');
const {ensureAuthenticated,forwardAuthenticated}=require('../config/auth');
const path = require('path');
router.use(express.json());
// router.use( '/admin/assets', express.static( path.join( __dirname, 'assets' ) ) );
router
    .route('/')
    .get(forwardAuthenticated,admin.adminLogin)
    .post(admin.adminLoginPost);

router
    .route('/dashboard')
    .get(ensureAuthenticated,admin.dashboard);

router
    .route('/logout')
    .get(ensureAuthenticated,admin.logout)

module.exports = router;
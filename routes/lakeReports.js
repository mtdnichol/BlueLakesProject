const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isCreator, validateLakeReport } = require('../middleware');

const lakeReports = require('../controllers/lakeReports'); //Allows you to use methods defined in /controllers/lakeReports

router.route('/')
    .get(isLoggedIn, catchAsync(lakeReports.index)) // INDEX route
    .post(isLoggedIn, validateLakeReport, catchAsync(lakeReports.createLakeReport)); // CREATE route

router.get('/new', isLoggedIn, lakeReports.renderNewForm); // CREATE route

router.route('/:id')
    .get(isLoggedIn, catchAsync(lakeReports.showLakeReport)) // SHOW route
    .put(isLoggedIn, isCreator, validateLakeReport, catchAsync(lakeReports.updateLakeReport)) // EDIT route  REMEMBER TO VALIDATE
    .delete(isLoggedIn, catchAsync(lakeReports.deleteLakeReport)); // DELETE route

router.get('/:id/edit', isLoggedIn, isCreator, catchAsync(lakeReports.renderEditForm)); // EDIT route

module.exports = router;


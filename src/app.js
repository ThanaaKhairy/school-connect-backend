const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const gradeRoutes = require('./routes/gradeRoutes');



const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.use('/api/v1/grades', gradeRoutes);

app.use(errorHandler);

module.exports = app;


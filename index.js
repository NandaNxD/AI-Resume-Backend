const express = require('express')
const app = express()

const fileUpload = require('express-fileupload');
const fs = require('fs');
const pdf = require('pdf-parse');

require('dotenv').config();
const PORT= process.env.PORT;

app.use(fileUpload());


app.get('/', function (req, res) {
    res.send('Service Running');
})


app.post('/upload', function(req, res) {
    console.log(req.files['pdf']); // the uploaded file object

    const dataBuffer=req.files['pdf'];

    pdf(dataBuffer).then(function(data) {
        
        res.send(data.text)
            
    });

});

app.listen(PORT)
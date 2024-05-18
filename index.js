const express = require('express')
const app = express()

app.get('/', function (req, res) {

    const fs = require('fs');
    const pdf = require('pdf-parse');
    
    let dataBuffer = fs.readFileSync('C:/Users/Asus/Desktop/RESUME.pdf');
    
    pdf(dataBuffer).then(function(data) {
    
        // number of pages
        console.log(data.numpages);
        // number of rendered pages
        console.log(data.numrender);
        // PDF info
        console.log(data.info);
        // PDF metadata
        console.log(data.metadata); 
        // PDF.js version
        // check https://mozilla.github.io/pdf.js/getting_started/
        console.log(data.version);
        // PDF text
        
        res.send(data.text)
            
    });


  
})

app.listen(3000)
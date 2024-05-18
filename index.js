const express = require('express')
const app = express()

const cors=require('cors')
const fileUpload = require('express-fileupload');
const fs = require('fs');
const pdf = require('pdf-parse');

require('dotenv').config();
const PORT = process.env.PORT;

app.use(fileUpload());
app.use(cors())


const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/json",
};

async function getResultsFromGemini(resumeTextDump) {

    const prompt=`
        INPUT: 'Text from a resume',
        INPUT TEXT:\"${resumeTextDump}\",
        OUTPUT: 'Get resume out of the text input,send Response exactly like OUTPUT STRUCTURE',
        OUTPUT STRUCTURE: {
            resume:"",
            keywords:[]
        }, 
        where resume in  OUTPUT STRUCTURE will be resume that you create fcrom text and
        keywords will be IT and Technical skill keywords only,
        Example Output: {
            resume:'Nandan T S\n Frontend developer\n\nskills: python,javascript,angular....'
            keywords:['python','javascript'...]
        },ONLY HARD TECHNICAL SKILLS`

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    pattern = '\{[^{}]*\}'

    console.log(text);

    return text.match(pattern).at(0);
}


app.get('/', function (req, res) {
    res.send('Service Running');
})


app.post('/upload', function (req, res) {
    console.log(req.files['pdf']); // the uploaded file object

    const dataBuffer = req.files['pdf'];

    pdf(dataBuffer).then(function (data) {

        return data.text;

    }).then((text) => {

        return getResultsFromGemini(text)

    }).then((geminiResponse)=>{
        res.send(geminiResponse);
    });

});

app.listen(PORT)
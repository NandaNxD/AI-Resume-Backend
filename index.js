const express = require('express')
const app = express()

const cors=require('cors')
const fileUpload = require('express-fileupload');
const fs = require('fs');
const pdf = require('pdf-parse');

const { YoutubeTranscript } = require('youtube-transcript');

require('dotenv').config();
const PORT = process.env.PORT;

app.use(fileUpload());
app.use(cors())


const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    generationConfig:{"response_mime_type": "application/json"}
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    responseMimeType: "text/json",
};

async function getResultsFromGemini(resumeTextDump) {

    const prompt=`
        
        INPUT: 'Text from a resume',
        INPUT TEXT:\"${resumeTextDump}\",
        OUTPUT: 'Get resume out of the text input,send Response exactly like OUTPUT STRUCTURE, Return isResume=false as a response if text is not from a resume',
        OUTPUT STRUCTURE: {
            resume:{
                name: '',
                role: '',
            
                contact: {
                    location: '',
                    gmail: '',
                    linkedIn: '',
                    github: '',
                    phoneNumber: '',
                },
            
                experience: [
                    {
                        company: '',
                        location: '',
                        role: '',
                        startYear: '',
                        endYear: '',
                        responsibilities: [
                            {
                                description: '',
                                skills: []
                            }
                        ]
                    }
                ],
            
                skills: [
            
                ],
            
                education: [
                    {
                        organization: '',
                        startYear: '',
                        endYear: '',
                        specialization: '',
                        degree: '',
                        grade: ''
                    }
                ],
            
                projects: [
                    {
                        name: '',
                        skills: [],
                        description: ''
                    }
                ],

                achievements:[

                ]
            },
            isResume:boolean
            suggestionsforImprovement:[],
            keywords:[]
        }, 
        where resume in  OUTPUT STRUCTURE will be resume that you create fcrom text and
        keywords will be IT and Technical skill keywords only,
        Example Output: {
            resume:{
                name:Nandan T S,
                role:'Frontend Developer',
                ...
            }
            
            suggestionsforImprovement:['..','....'],
            keywords:['python','javascript'...],
        },ONLY HARD TECHNICAL SKILLS,DONT SKIP newline, spaces in text, Give suggestions for improvements in resume and put them in list,
      `



    const result = await model.generateContent(prompt);
    
    const response = await result.response;
    const text = response.text();

    pattern = '\{[^{}]*\}'

    console.log(text);

    return text;
}


async function getYoutubeVideoSummary(videoTranscript){
    const prompt=`You are a youtube video summarizer ai, summarize the video transcript in less than 300 words, 
        INPUT:${videoTranscript},
        OUTPUT_STRUCTURE: {videoSummary:''}`
    const result = await model.generateContent(prompt);

    console.log(result);
    
    const response = await result.response;
    const text = response.text();
    return text;
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


app.get('/summary',async function (req, res) {
    const transcriptResponse=await YoutubeTranscript.fetchTranscript(req.query.videoId);

    let transcriptResponseText='';

    for(let {text} of transcriptResponse){
        transcriptResponseText+=text;
    }

    const response=await getYoutubeVideoSummary(transcriptResponseText);

    res.send(response);

});

app.listen(PORT)
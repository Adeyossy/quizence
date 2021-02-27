const express = require('express');
const app = express();
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: String,
    options: [ { option: { type: String }, answer: Boolean } ]
});

const courseSchema = new mongoose.Schema({
    year: Number,
    type: { type: String },
    course: String,
    questions: [ questionSchema ]
});

const courseModel = mongoose.model('Medicine', courseSchema);

mongoose.connect("mongodb+srv://Deyosse:Jimmeyjoe1997@quizence.hjjzf.mongodb.net/quizence?retryWrites=true&w=majority", { 
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const connectionStatus = mongoose.connection;
connectionStatus.on('error', console.error.bind(console, 'connection: '));
connectionStatus.once('open', () => {
    // console.log("we're connected to quizence database");
});

app.get('/', (req, res) => {
    res.send("<h2>Quizence is live</h2>");
});

app.get('/:course', (req, res, next) => {
    const CourseModel = mongoose.model(String(req.params.course), courseSchema, String(req.params.course));
    CourseModel.find({}, (err, desiredCourse) => {
        if(err) {
          next();
        }
        // console.log(desiredCourse);
         res.send(JSON.stringify(desiredCourse));
    });
});

app.get('/*', (req, res) => {
  res.send(JSON.stringify([]));
})

app.listen(process.env.PORT || 8000, () => {
    if(!process.env.PORT) console.log("port 8000");
});
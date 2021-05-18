const express = require('express');
const app = express();
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  options: [{ option: { type: String }, answer: Boolean, isAnswered: Boolean }]
});

const questionCollationSchema = questionSchema.clone().add({ collationid: 'string', _id: 'objectId' });

const courseSchema = new mongoose.Schema({
  year: Number,
  type: { type: String },
  course: String,
  questions: [questionSchema]
});

const collationSchema = new mongoose.Schema({
  course: String,
  posting: String,
  subposting: String,
  numberofquestions: String,
  type: { type: String },
  date: Number,
  duration: Number,
  group: String,
  set: String,
  questions: [questionCollationSchema]
})

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send("<h2>Quizence is live</h2>");
});

app.post('/:course/collation', (req, res) => {
  const course = String(req.params.course).concat("collation");
  const collationDetails = req.body;
  const CollationModel = mongoose.model(course, collationSchema, course);
  const CollationDocument = new CollationModel({
    course: collationDetails.course,
    posting: collationDetails.mPosting,
    subposting: collationDetails.mSubPosting,
    numberofquestions: collationDetails.mNumberOfQuestions,
    type: collationDetails.mQuestionType,
    date: collationDetails.mCollationDate,
    duration: collationDetails.mTestDuration,
    questions: collationDetails.mQuestions,
    set: collationDetails.mSet,
    group: collationDetails.mGroup
  });

  //save the created document
  CollationDocument.save().then((savedDocument) => {
    if (savedDocument === CollationDocument) {
      res.status(200).send("Collation Saved Successfully");
    }
  }).catch(() => {
    res.status(500).send("Not saved");
  });
});

app.get('/:course/collation', (req, res) => {
  const course = String(req.params.course);
  const course_collation = String(req.params.course).concat("collation");
  // const question = req.body;
  // const CourseModel = mongoose.model(course, courseSchema);
  const CollationModel = mongoose.model(course_collation, collationSchema, course_collation);
  CollationModel.find({ course: course }, (err, foundCollations) => {
    if (err) {
      res.status(500).send(JSON.stringify(err));
    }

    res.status(200).send(JSON.stringify(foundCollations));
  });
});

app.post('/:course/collation/:subposting', (req, res) => {
  const course = String(req.params.course);
  const course_collation = course.concat("collation");
  let subposting = String(req.params.subposting);
  subposting = subposting.replace(" ", "");
  const sentQuestion = req.body;

  const QuestionCollation = mongoose.model('questioncollation', questionCollationSchema,
    'questionCollation');
  const thisQuestion = new QuestionCollation({
    question: sentQuestion.mQuestionTitle,
    option: sentQuestion.mOptions,
    collationid: sentQuestion.mSourceID
  });

  const CollationModel = mongoose.model(course_collation, collationSchema);
  CollationModel.findByIdAndUpdate(sentQuestion.mSourceID, {
    $push: {
      questions: {
        _id: new mongoose.Types.ObjectId(),
        question: sentQuestion.mQuestionTitle,
        option: {
          option: sentQuestion.mOptions.mOption,
          answer: sentQuestion.mOptions.mIsAnswer,
          isAnswered: sentQuestion.mOptions.mIsMarked
        },
        collationid: sentQuestion.mSourceID
      }
    }
  },
  {
    new: true
  },
    (err, result) => {
      if (err) res.status(500).send("An error occured: " + err);
      console.log(req.body);
      console.log(result);
      res.sendStatus(200);
    });
});
/* 
app.get('/:course/collation/:unique', (req, res) => {
  const course = String(req.params.course);
  const course_collation = course.concat("collation");
  const unique = String(req.params.unique);

  const QuestionCollation = mongoose.model('questioncollation')
});
 */
app.get('/:course', (req, res, next) => {
  const CourseModel = mongoose.model(String(req.params.course), courseSchema, String(req.params.course));
  CourseModel.find({}, (err, desiredCourse) => {
    if (err) {
      next();
    }
    // console.log(desiredCourse);
    res.send(JSON.stringify(desiredCourse));
  });
});

app.get('/*', (req, res) => {
  res.send(JSON.stringify([]));
});

app.listen(process.env.PORT || 8000, () => {
  if (!process.env.PORT) console.log("port 8000");
});
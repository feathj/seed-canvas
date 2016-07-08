const axios = require('axios');
const fs = require('fs');

// Init ///////////////////////////////////////////////////////////////
const canvasBaseUrl = 'https://jfeatherstone.instructure.com';
const accountId = 1;


const canvasAccessToken = process.env.CANVAS_ACCESS_TOKEN;
if(!canvasAccessToken){
  console.log('No api access token provided in env: CANVAS_ACCESS_TOKEN');
  process.exit();
}
axios.defaults.baseURL = canvasBaseUrl;
axios.defaults.headers.common.Authorization = `Bearer ${canvasAccessToken}`;

// Helpers ////////////////////////////////////////////////////////////
function parseName(fullName){
  let nameTuple = fullName.split(' ');
  if(nameTuple.length === 2){
    return {
      first: nameTuple[0],
      last: nameTuple[1],
      full: fullName
    };
  } else if(nameTuple.length === 3) {
    return {
      first: nameTuple[0],
      middle: nameTuple[1],
      last: nameTuple[2],
      full: fullName
    };
  } else {
    return null;
  }
}

function createCourse(courseCode, courseName) {
  let courseRecord = {
    course: {
      name: courseName,
      course_code: courseCode
    }
  };
  return axios.post(`/api/v1/accounts/${accountId}/courses`, courseRecord);
}

function createStudent(studentName) {
  let email = `${studentName.first[0] + studentName.last}@example.com`;
  let studentRecord = {
    user: {
      name: studentName.full,
      short_name: studentName.first,
      sortable_name: `${studentName.last}, ${studentName.first}`
    },
    pseudonym: {
      unique_id: email,
    },
    communication_channel: {
      type: 'email',
      address: email,
      skip_confirmation: true
    }
  };
  return axios.post(`/api/v1/accounts/${accountId}/users`, studentRecord);
}

function enrollInCourse(studentId, courseId, enrollmentType) {
  // TODO
}

// Main ///////////////////////////////////////////////////////////////

// Create courses promises ////////////////////////////////////////////
fs.readFile('courses.txt', 'utf8', (err, data) => {
  let coursePromises = [];
  let studentPromises = [];

  let lines = data.split('\n');
  for(let line of lines){
    const courseTuple = line.split(': ');
    if(courseTuple.length === 2){
      coursePromises.push(createCourse(courseTuple[0], courseTuple[1]));
    }
  }

  // Create student promises ////////////////////////////////////////////
  fs.readFile('students.txt', 'utf8', (err, data) => {
    let lines = data.split('\n');
    for(let line of lines){
      let nameObj = parseName(line);
      if(nameObj){
        studentPromises.push(createStudent(nameObj));
      }
    }

    // Grab results from courses and students, and create enrollments
    axios.all(coursePromises).then((courseResults) => {
      // Get course id from results
      let courseIds = courseResults.map(r => r.data.id);
      axios.all(studentPromises).then((studentResults) => {
        // Get student id from results
        let studentIds = studentResults.map(r => r.data.id);

        // TODO: Enrollments

      });
    });

  });
});

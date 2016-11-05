var socsjs = require('../lib/schedule.js');

var quarter = 'FA16';
var query = 'CSE105';
var timeout = 10000;


// Searching a single page by ID (CSE 105)
socsjs.findCourse('WI17', '895719', timeout, true).then(function(result) {
  console.log(result);
}).catch(function(err) {
  console.log(err, 'oops!');
});


// Searching multi page  by ID (WCWP 10A)
socsjs.findCourse('WI17', '888999', timeout, true).then(function(result) {
  console.log(result);
}).catch(function(err) {
  console.log(err, 'oops!');
});


// Searching multiple courses by ID
var queries = ['894490', '888993', '894515'];
socsjs.findCourses('WI17', queries, timeout, true).then(function(result) {
    console.log(result);    // returns an array of Courses
    for (var i in result) {
      console.log(result[i])
    }
}).catch(function(err) {
    console.log(err, 'oops!');
});


socsjs.findCourse(quarter, query, timeout).then(function(result) {
    console.log(result);    // returns a Course
    console.log(result.sections[0].isEnrollable);   // true
}).catch(function(err) {
    console.log(err, 'oops!');
});


var queries = ['cse11', 'cse12', 'WCWP10A'];
socsjs.findCourses(quarter, queries, timeout).then(function(result) {
    console.log(result);    // returns an array of Courses
}).catch(function(err) {
    console.log(err, 'oops!');
});


var dept = 'ANTH';
socsjs.searchDepartment(quarter, dept, timeout, true).then(function(result) {
    console.log(result);    // returns an array of Courses
}).catch(function(err) {
    console.log(err, 'oops!');
});


// check default timeout
socsjs.findCourse(quarter, query).then(function(result) {
    console.log("Default timeout success");
}).catch(function(err) {
    console.log(err, 'oops!');
});

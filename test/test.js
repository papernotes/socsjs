var socsjs = require('../lib/schedule.js');

var quarter = 'FA16';
var query = 'CSE105';
var timeout = 10000;

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
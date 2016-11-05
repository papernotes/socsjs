# socsjs (schedule of classes scraper)
[![npm](https://img.shields.io/npm/v/socsjs.svg?style=flat-square)](https://www.npmjs.com/package/socsjs)
[![npm](https://img.shields.io/npm/l/socsjs.svg?style=flat-square)](https://www.npmjs.com/package/socsjs)

A scraper that simulates an API for [UCSD's Schedule of Classes](https://act.ucsd.edu/scheduleOfClasses/scheduleOfClassesStudent.htm)  
Many thanks to [@andrewthehan](https://github.com/andrewthehan) and [@davidmrdavid](https://github.com/davidmrdavid)  
Check out a [project](https://github.com/papernotes/trendy-socs) made with socsjs!

## Installation
```
npm install socsjs --save
```

## Usage
```javascript
var socsjs = require('socsjs');
```
### Finding a course
*Default timeout value is at 5000ms*
```javascript
var quarter = 'FA16';
var query = 'CSE105';
var timeout = 5000;
socsjs.findCourse(quarter, query, timeout).then(function(result) {
    console.log(result);    // returns a Course
    console.log(result.sections[0].isEnrollable);   // true
}).catch(function(err) {
    console.log(err, 'oops!');
});
```
### Finding a course by section id
```javascript
var quarter = 'WI17';
var query = '895719';
var timeout = 5000;
var byId = true;
socsjs.findCourse(quarter, query, timeout, byId).then(function(result) {
    console.log(result);    // returns a Course
}).catch(function(err) {
    console.log(err, 'oops!');
});
```
### Finding courses
```javascript
var quarter = 'FA16';
var queries = ['cse11', 'cse12', 'WCWP10A'];
var timeout = 5000;
socsjs.findCourses(quarter, queries, timeout).then(function(result) {
    console.log(result);    // returns an array of Courses
}).catch(function(err) {
    console.log(err, 'oops!');
});
```
### Finding multiple courses by section id
```javascript
var quarter = 'WI17';
var queries = ['894490', '888993', '894515'];
var timeout = 5000;
var byId = true;
socsjs.findCourses(quarter, queries, timeout, byId).then(function(result) {
    console.log(result);    // returns an array of Courses
}).catch(function(err) {
    console.log(err, 'oops!');
});
```
### Searching a department
```javascript
var quarter = 'FA16';
var dept = 'ANTH';
var timeout = 10000;
var undergrad = true;   // optional boolean to select only undergrad courses (< 200)
socsjs.searchDepartment(quarter, dept, timeout, undergrad).then(function(result) {
    console.log(result);    // returns an array of undergrad Courses
}).catch(function(err) {
    console.log(err, 'oops!');
});
```
## Objects
### `Course`
A `Course` object has a String `name` and an array `sections`.  
`sections` is made up of `CourseElements`
### `CourseElement`
A `CourseElement` contains information about a `Course`.
```javascript
var CourseElement = function(type, id, section, days, time, location, teacher, openSeats, seatLimit) {
    this.type = type;           // String describing a course element (eg. 'final', 'discussion')
    this.sectionID = id;        // Null or String of the section's ID (eg. '123456')
    this.section = section;     // Null or String of the section  (eg. 'A01')
    this.days = days;           // String of the days (eg. 'MWF')
    this.time = time;           // String of the time as shown on the Schedule of Classes site
    this.location = location;   // String of the location
    this.teacher = formatProf(teacher);     // Null or String of LastName, FirstName of teacher
    this.openSeats = openSeats; // Null or Number of how many seats are available
    this.seatLimit = seatLimit; // Null or Number of the course element's class limit

    this.waitlistSize = 0;      // Null or Number of people on the waitlist
    this.isEnrollable = false;  // Boolean for if a class element is enrollable
}
```
## Types
These are the mappings to the different meeting types  

| Code  | Description | socjs Type (string) |
|:----------:|:-------------:|:--------:|
|```DI```|Discussion|```discussion```|
|```LE```|Lecture|```lecture```|
|```LA```|Laboratory|```lab```|
|```SE```|Seminar|```seminar```|
|```ST```|Studio|```studio```|
|```IN```|Independent Study|```independentStudy```|
|```MI```|Midterm|```midterm```|
|```AC```|Activity|```activity```|
|```CL```|Clinical Clerkship|```clinicalClerkship```|
|```CO```|Conference|```conference```|
|```FI```|Final Exam|```finalExam```|
|```FM```|Film|```film```|
|```FW```|Fieldwork|```fieldwork```|
|```IT```|Internship|```internship```|
|```MU```|Make-up Session|```makeup```|
|```OT```|Other Additional Meeting|```otherMeeting```|
|```PB```|Problem Session|```problemSession```|
|```PR```|Practicum|```practicum```|
|```RE```|Review Session|```reviewSession```|
|```TU```|Tutorial|```tutorial```|


## TODOs
- [x] Add support for other Meeting Types
- [ ] Add filters to get information easily
- [x] Add search by Section ID
- [ ] Add course units
- [ ] Add prereqs
- [ ] Add Restriction codes
- [ ] Fix error handling
- [ ] Handle nonexistant courses and quarters
- [ ] Fix tests (verbose, type checking)
- [x] Set default timeout value
- [ ] Format CourseElement fields, such as setting time to have start/end or having proper spacing for teacher names
- [ ] Set up for ES6

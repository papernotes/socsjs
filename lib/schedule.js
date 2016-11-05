var request = require('request');
var cheerio = require('cheerio');
var Course = require('../lib/course.js');
var Processor = require('../lib/processor.js');

var DEFAULT_TIMEOUT = 5000;

var originalForm = {
    'loggedIn':'false',
    'tabNum':'tabs-crs',
    'schedOption1':'true',
    'schedOption2':'true',
    'schDay':'S',
    'schStartTime':'12:00',
    'schStartAmPm':'0',
    'schEndTime':'12:00',
    'schEndAmPm':'0',
    'schedOption1Dept':'true',
    'schedOption2Dept':'true',
    'schDayDept':'S',
    'schStartTimeDept':'12:00',
    'schStartAmPmDept':'0',
    'schEndTimeDept':'12:00',
    'schEndAmPmDept':'0',
    'instructorType':'begin',
    'titleType':'contain'
};

var pagePatt = new RegExp(/Page(\(\d+of\d+\))/i);
var finalPagePatt = new RegExp(/\d+\)/i);
var classNumberPatt = new RegExp(/\d+\w*/i);
var numberPatt = new RegExp(/\d+/i);


// Finds a single course
exports.findCourse = function(term, classname, timeout, byId) {
    timeout = (typeof timeout !== 'undefined') ? timeout : DEFAULT_TIMEOUT;
    
    var madeForm = JSON.parse(JSON.stringify(originalForm));
    var classNumber;

    madeForm.selectedTerm = term;

    if (byId) {
        madeForm.sections = classname;
        madeForm.tabNum = 'tabs-sec';
    }
    else {
        madeForm.courses = classname;
    }

    if (byId) {
        classNumber = null;
    }
    else {
        classNumber = classNumberPatt.exec(classname)[0];
    }

    var options = {
        url: 'https://act.ucsd.edu/scheduleOfClasses/scheduleOfClassesStudentResult.htm',
        method: 'POST',
        form: madeForm,
        timeout: timeout
    };

    return sendRequest(options, timeout).then(function(body) {
        // determine if there are multiple pages
        var pages = isMultiPage(body);

        // if there are multiple pages, do a multipage request
        if (pages) {
            return new Promise(function(fulfill, reject) {
                var timer = setTimeout(reject, timeout);
                requestMultiPage(madeForm, pages, body, timeout).then(function(resp) {
                    if (byId) {
                        fulfill(createCourse(resp, null, byId, classname));
                    }
                    else {
                        fulfill(createCourse(resp, classNumber));
                    }
                    clearTimeout(timer);
                });
            }).catch(function(err) {
                return Promise.reject(null);
            });
        }

        else {
            if (byId) {
                return Promise.resolve(createCourse(body, null, byId, classname))
            }
            return Promise.resolve(createCourse(body, classNumber));
        }
    }).catch(function(err) {
        return Promise.reject(null);
    });
};


// Finds multiple courses
exports.findCourses = function(term, classnames, timeout, byId) {
    timeout = (typeof timeout !== 'undefined') ? timeout : DEFAULT_TIMEOUT;
    var actions;

    if (byId) {
        actions = classnames.map(function(x) {
            return exports.findCourse(term, x, timeout, byId).catch(function(err) {
                return Promise.reject(null);
            });
        });
    }
    else {
        actions = classnames.map(function(x) {
            return exports.findCourse(term, x, timeout).catch(function(err) {
                return Promise.reject(null);
            });
        });
    }

    var results = Promise.all(actions);

    return results.then(function(result) {
        return result;
    }).catch(function(err) {
        return Promise.reject(null);
    });
};


// Finds all classes for a department
exports.searchDepartment = function(term, departmentName, timeout, undergrad) {
    timeout = (typeof timeout !== 'undefined') ? timeout : DEFAULT_TIMEOUT;

    var madeForm = JSON.parse(JSON.stringify(originalForm));
    madeForm.selectedTerm = term;
    madeForm.courses = departmentName;

    var options = {
        url: 'https://act.ucsd.edu/scheduleOfClasses/scheduleOfClassesStudentResult.htm',
        method: 'POST',
        form: madeForm,
        timeout: timeout
    };

    return sendRequest(options, timeout).then(function(body) {

        var pages = isMultiPage(body);
        if (pages) {
            return new Promise(function(fulfill, reject) {
                var timer = setTimeout(reject, timeout);
                requestMultiPage(madeForm, pages, body, timeout).then(function(resp) {
                    fulfill(findTitles(resp));
                    clearTimeout(timer);
                });
            }).catch(function(err) {
                return Promise.reject(null);
            });
        }
        else {
            return Promise.resolve(findTitles(body));
        }
    })
    .then(function(titles) {
        var classNames = [];

        for(i=0; i < titles.length; i++) {
            // save all classes if we don't care about just undergrad classes
            if (!undergrad) {
                classNames.push(departmentName + titles[i]);
            }
            // if we care about undergrad classes, place restriction
            else if (undergrad && numberPatt.exec(titles[i])[0] < 200) {
                classNames.push(departmentName + titles[i]);
            }
        }

        if (classNames.length === 0) {
            var returnCourse = new Course();
            var processor = new Processor();

            returnCourse.add(processor.element);
            returnCourse.name = processor.department;

            return [returnCourse];
        }

        return exports.findCourses(term, classNames, timeout);
    });
};


// Gets the titles of a course from a page
function findTitles(html) {
    var $ = cheerio.load(html);
    var titles = [];
    $("table.tbrdr").find("tr").each(function(i, element) {
        $(element).children("td").each(function(i, element) {
            if ($(this).attr("class") == "crsheader") {
                var arr = [];
                arr.push($(this).text());
                $(this).nextAll().toArray().forEach(function(element, i) {
                    arr.push($(element).text().replace(/\s+/g, ""));
                });
                if (titles.indexOf(arr[1]) == -1) {
                    titles.push(arr[1]);
                }
                return false;
            }
        });
    });
    return titles;
}


// Sends the request for the website
function sendRequest(options, timeout) {
    var timer;
    return new Promise(function(fulfill, reject) {
        timer = setTimeout(reject, timeout);
        request.post(options, function(err, resp, body) {
            if (err) {
                reject(err);
            }
            else {
                fulfill(body);
            }
            clearTimeout(timer);
        });
    }).catch(function(err) {
        clearTimeout(timer);
        return Promise.reject(null);
    });
}


// Determines if there are multiple pages to parse (takes in Cheerio object)
function isMultiPage(html) {
    var $ = cheerio.load(html);
    var pages = null;
    $('tbody').find('tr').find('td').nextAll().each(function(i, element) {
        if (pagePatt.test($(this).text().replace(/\s+/g, ""))) {
            pages = pagePatt.exec($(this).text().replace(/\s+/g, ""))[0];
            pages = finalPagePatt.exec(pages)[0];
            pages = pages.substring(0, pages.length - 1);
            return false;
        }
    });
    if (pages == 1) {
        return false;
    }
    return pages;
}


/*
    Sends multiple requests for the website pages and returns the html results
    http://stackoverflow.com/questions/31413749/node-js-promise-all-and-foreach
    Returns html body on success
*/
function requestMultiPage(form, multi, originalBody, timeout) {
    reqs = [];
    for(i=2; i<=multi; i++) {
        reqs.push('https://act.ucsd.edu/scheduleOfClasses/scheduleOfClassesStudentResult.htm?page=' + i);
    }


    var fn = function multiRequest(url) {
        var multiOptions = {
            url: url,
            method: 'POST',
            form: form,
            timeout: timeout
        };
        return sendRequest(multiOptions, timeout).then(function(body) {
            return body;
        }).catch(function(err) {
            return Promise.reject(null);
        });
    };

    var actions = reqs.map(fn);
    var results = Promise.all(actions);

    // for each of the results, process
    return results.then(function(result) {
        var html = originalBody;
        for(i=0;i<result.length;i++) {
            html = html + result[i];
        }
        return html;
    }).catch(function(err) {
        return Promise.reject(null);
    });
}

// properly adds professors
function addProf(course) {
    var copy = JSON.parse(JSON.stringify(course));
    var profs = {};

    for (var key in copy) {
        if (key != 'name' && key != 'finals') {
            for (var courseElement in copy[key]) {
                // save the course element
                var c = copy[key][courseElement];
                if (c.teacher !== '' && c.teacher != null)
                    profs[c.section[0]] = c.teacher;
            }
        }
    }

    var result = course.sections.map(function(i) {
        if (i.teacher === '') {
            if (i.section[0] in profs) {
                i.teacher = profs[i.section[0]];
            }
        }
        return i;
    });
}

/*
    Takes the html body
    Creates a course element for the user to receive
*/
function createCourse(html, classNumber, byId, id) {
    var $ = cheerio.load(html);
    var returnCourse = new Course();
    var processor = new Processor();


    $("table.tbrdr").find("tr").each(function(i, element) {
        processor.parse($, $(this).get(0), classNumber);
        returnCourse.add(processor.element, id);
        returnCourse.name = processor.department;
    });
    addProf(returnCourse);

    return returnCourse;

}

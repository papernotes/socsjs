var CourseElement = require('../lib/courseElement.js');
var typeSetter = require('../lib/typeSetter');


var Processor = function() {
    this.type = null;
    this.department = null;
    this.element = null;
    this.oldCourse = null;
    this.name = null;
    this.code = null;
    this.units = null;
};

function getCourseTitle(str) {
    return str.substring(0, str.indexOf('\r')).trim();
}

function getCourseUnits(str) {
    str = str.replace(/\s+/g, '');
    return new RegExp(/\d+(?=Units)/i).exec(str)[0];
}


// pushes a course to a specific array
Processor.prototype.parse = function($, element, classNumber) {
    // if we find a new course, end
    if (classNumber && this.oldCourse && this.oldCourse.toLowerCase() != classNumber.toLowerCase()) {
        return;
    }

    var regSecPatt = new RegExp(/\d{6}/i);
    var regNamePatt = new RegExp(/\(\w+\D\)/i);
    var waitlistPatt = new RegExp(/(\d+)/i);

    var parseElement;
    var departmentName = null;
    var courseName = null;
    var courseTitle = null;
    var courseUnits = null;

    // determine the type of thing and then break early to return values
    $(element).children("td").each(function(i, element) {

        // get the department title
        if ($(this).attr("colspan") == 13 && regNamePatt.test($(this).text().replace(/\s+/g, ''))) {
            departmentName = "" + regNamePatt.exec($(this).text().replace(/\s+/g, ''));
            departmentName = departmentName.substring(1, departmentName.length - 1);
            return false;
        }

        // course information 
        //TODO add support for section types
        else if ($(this).parent().attr("class") == "sectxt") {
            var arr = [];
            var id = null;
            arr.push($(this).text());
            $(this).nextAll().toArray().forEach(function(element, i) {
                arr.push($(element).text().replace(/\s+/g, ""));
            });

            // get the section number
            regSecPatt.test(arr[2]) ? id = arr[2] : id = null;
            
            var type = typeSetter(arr[3]);

            // complete values
            if (arr.length == 13){
                parseElement = new CourseElement(type, id, arr[4], arr[5], arr[6], arr[7] + " " + arr[8], arr[9], arr[10], arr[11]);
            }

            // TBA values
            else if (arr.length == 10) {
                if (arr[7] == "Unlim")
                    parseElement = new CourseElement(type, id, arr[4], "TBA", "TBA", "TBA", arr[6], -1, -1);
                else
                    parseElement = new CourseElement(type, id, arr[4], "TBA", "TBA", "TBA", arr[6], arr[7], arr[8]);
            }

            // cancelled values
            else if (arr.length == 6) {
                parseElement = new CourseElement(type, id, arr[4], null, null, null, null, 0, 0);
                parseElement.isCancelled = true;
                return false;
            }

            if (parseElement.openSeats === "") parseElement.openSeats = null;
            if (parseElement.seatLimit === "") parseElement.seatLimit = null;

            return false;
        }

        // skip these rows - contains ertext and class topics
        else if ($(this).attr("colspan") == 11) {
            return false;
        }

        // finals - 10 columns (size 2 nonenrtxt if it's some class topic)
        else if ($(this).parent().attr("class") == "nonenrtxt" && $(this).nextAll().length == 9) {
            var arr = [];
            arr.push($(this).text());
            $(this).nextAll().toArray().forEach(function(element, i) {
                arr.push($(element).text().replace(/\s+/g, ""));
            });

            // TODO review classes, add teacher to the final
            if (arr[2] == "FI") {
                if (arr[6] == "TBA") {
                    parseElement = new CourseElement("final", null, null, arr[3] + " " + arr[4], arr[5], "TBA", null, null, null);
                }
                else {
                    parseElement = new CourseElement("final", null, null, arr[3] + " " + arr[4], arr[5], arr[6] + " " + arr[7], null, null, null);
                }
            }
            return false;
        }

        // class header
        // TODO if we find the header, get the number and add it to the departmentName, and change result
        else if ($(this).attr("class") == "crsheader") {
            var arr = [];
            var test = [];
            arr.push($(this).text());
            $(this).nextAll().toArray().forEach(function(element, i) {
                // test.push($(element).text().trim());
                arr.push($(element).text().trim());
            });

            courseName = arr[1];

            // getting the title and units
            if (arr[2].match(new RegExp(/(?=Units)/i))) {
                courseTitle = getCourseTitle(arr[2]);
                courseUnits = getCourseUnits(arr[2]);
            }

            return false;
        }
    });


    // department name formatting
    if (departmentName) {
        this.department = departmentName;
    }
    if (this.department && this.department.length <= 4 && courseName && this.department.indexOf(courseName) == -1) {
        this.code = courseName;
    }

    if (courseTitle) {
        this.name = courseTitle;
    }
    if (courseUnits) {
        this.units = parseInt(courseUnits);
    }

    // waitlist formatting
    if (parseElement && parseElement.openSeats) {
        if (parseElement.openSeats != -1 && parseElement.openSeats.indexOf("FULL") > -1) {
            parseElement.waitlistSize = waitlistPatt.exec(parseElement.openSeats)[0];
            parseElement.openSeats = 0;
        }
    }

    // set flag when we find a different class
    if (courseName) {
        this.oldCourse = courseName;
    }

    // converting results to int formatting and last bits of formatting
    if (parseElement) {
        if (parseElement.openSeats) {
            if (!isNaN(parseInt(parseElement.openSeats)))
                parseElement.openSeats = parseInt(parseElement.openSeats) || 0;
        }
        if (parseElement.waitlistSize) {
            if (!isNaN(parseInt(parseElement.waitlistSize)))
                parseElement.waitlistSize = parseInt(parseElement.waitlistSize) || 0;
        }
        if (parseElement.seatLimit) {
            if (!isNaN(parseInt(parseElement.seatLimit)))
                parseElement.seatLimit = parseInt(parseElement.seatLimit) || 0;
        }
        if (parseElement.type == 'final') {
            parseElement.waitlistSize = null;
        }
        if (parseElement.id && !parseElement.isEnrollable && !parseElement.isCancelled) {
            parseElement.isEnrollable = true;
        }
        if (parseElement.openSeats === null && parseElement.seatLimit === null && parseElement.waitlistSize === 0) {
            parseElement.waitlistSize = null;
        }
    }

    this.element = parseElement;
};


module.exports = Processor;

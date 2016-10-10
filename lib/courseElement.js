var CourseElement = function(type, id, section, days, time, location, teacher, openSeats, seatLimit) {
    this.type = type;
    this.sectionID = id;
    this.section = section;
    this.days = days;
    this.time = time;
    this.location = location;
    this.teacher = formatProf(teacher);
    this.openSeats = openSeats;
    this.seatLimit = seatLimit;

    this.waitlistSize = 0;
    this.isEnrollable = false;
};

function formatProf(prof) {
    if (prof === null)
        return null;

    // http://stackoverflow.com/questions/5582228/insert-space-before-capital-letters
    var newString = prof.replace(/([A-Z])/g, ' $1');
    return newString.substring(1, newString.length);
}

module.exports = CourseElement;

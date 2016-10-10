var Course = function() {
    this.name = null;
    this.sections = [];
};


Course.prototype.add = function(course) {
    if (course != null) {
        this.sections.push(course);
    }
};


module.exports = Course;

var Course = function() {
    this.name = null;
    this.sections = [];
};


Course.prototype.add = function(course, byId) {
    if (course != null && !byId) {
        this.sections.push(course);
    }
    else if (course != null && byId) {
      if (course.sectionID === byId) {
        this.sections.push(course);
      }
    }
};


module.exports = Course;

var Course = function() {
    this.department = null;
    this.code = null;
    this.name = null;
    this.sections = [];
    this.units = null;
};


Course.prototype.add = function(course, byId) {
    if (course != null && !byId) {
        this.sections.push(course);
    }
    else if (course != null && byId) {
      if (course.id === byId) {
        this.sections.push(course);
      }
    }
};


module.exports = Course;

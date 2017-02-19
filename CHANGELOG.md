## 2.0.0

### Changes
* An error is returned on failed queries detailing short timeout or no internet connection
* CourseElement
  * Add Boolean `isCancelled`
  * Replace `sectionID` with `id`
* Course
  * Change `name` to be the course's name and not the code
  * Add String `department`
  * Add String `code`
  * Add number `units`
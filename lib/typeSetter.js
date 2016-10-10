module.exports = function(type) {
    switch(type) {
        case "DI":
            return "discussion";
        case "LE":
            return "lecture";
        case "LA":
            return "lab";
        case "SE":
            return "seminar";
        case "ST":
            return "studio";
        case "IN":
            return "independentStudy";
        case "MI":
            return "midterm";
        case "AC":
            return "activity";
        case "CL":
            return "clinicalClerkship";
        case "CO":
            return "conference";
        case "FI":
            return "finalExam";
        case "FM":
            return "film";
        case "FW":
            return "fieldwork";
        case "IT":
            return "internship";
        case "MU":
            return "makeup";
        case "OT":
            return "otherMeeting";
        case "PB":
            return "problemSession";
        case "PR":
            return "practicum";
        case "RE":
            return "reviewSession";
        case "TU":
            return "tutorial";
        default:
            return "other";
    }
};
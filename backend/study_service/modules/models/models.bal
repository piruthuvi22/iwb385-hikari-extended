public type Week record {|
    readonly string id?;
    int weekNo;
    int year;
    string subjectId;
    string studentId;
    decimal goalHours;
    decimal actualHours;
    StudySession[] studySessions;
|};

public type StudySession record {|
    string lessonId;
    decimal noMins;
    string date;
|};


public type StudySessionDto record {|
    string subjectId;
    string studentId;
    string lessonId;
    decimal noMins;
    decimal goalHours;
|};

public type StudyStatusDto record {|
    string studentId;
    string subjectId;
    int weekNo;
    int year;
    decimal actualHours;
    decimal? goalHours;
    map<string>? lessonDates;
    string[]? studiedLessons;
|};

public type GoalAdjustDto record {|
    string studentId;
    string subjectId;
    decimal goalHours;
|};

public type StudySession record {|
    string subjectId;
    string studentId;
    string lessonId;
    decimal noMins;
    decimal goalHours;
|};

public type StudyStatus record {|
    string studentId;
    string subjectId;
    int weekNo;
    int year;
    decimal actualHours;
    decimal goalHours = 0;
    map<string>? lastStudiedDates;
    string[]? studiedWithinTheWeek;
|};

public type GoalAdjust record {|
    string studentId;
    string subjectId;
    decimal goalHours;
|};

public type UserSummary record {|
    string id;
    SubjectSummary[] subjects;
|};

public type SubjectSummary record {|
    string id;
    decimal goalHours;
    decimal actualHours;
|};

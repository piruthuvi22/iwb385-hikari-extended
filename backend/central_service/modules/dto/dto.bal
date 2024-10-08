public type User record {|
    readonly string id;
    UserSubject[] subjectIds = [];
    ID[] followersIds = [];
    ID[] followingIds = [];
    ID[] requestedIds = [];
    ID[] requestedByIds = [];
    boolean isDeleted = false;
|};

public type ID record {|
    string id;
|};

public type UserSubject record {|
    readonly string id;
    decimal goalHours;
|};

public type Subject record {|
    readonly string id;
    string name;
    decimal goalHours;
    decimal actualHours;
    Lesson[] lessons;
|};

public type StudyStatus record {|
    string studentId;
    string subjectId;
    int weekNo;
    int year;
    decimal actualHours;
    decimal goalHours;
    map<string>? lessonDates;
    string[]? studiedLessons;
|};

public type Lesson record {|
    readonly string id;
    string name;
    int no;
|};

public type UserStudySummary record {|
    string id;
    SubjectStudySummary[] subjects;
|};

public type SubjectStudySummary record {|
    string id;
    decimal goalHours;
    decimal actualHours;
|};

public type StudySession record {|
    string subjectId;
    string lessonId;
    int noMins;
|};
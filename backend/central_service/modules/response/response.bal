import central_service.dto;
public type UserDetails record {|
    string id;
    string? email = ();
    string? name = ();
    dto:Subject[] subjects = [];
|};

public type Friends record {|
    UserDetails[] followers = [];
    UserDetails[] following = [];
    UserDetails[] requested = [];
    UserDetails[] requestedBy = [];
|};

public type StudyStatus record {|
    string studentId;
    string subjectId;
    int weekNo;
    int year;
    decimal actualHours;
    decimal? goalHours;
    map<string>? lessonDates;
    string[]? studiedLessons;
    dto:Lesson[]? lessons;
|};
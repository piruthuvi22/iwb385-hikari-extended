import ballerina/http;
public type UserDetails record {|
    readonly string id;
    string email;
    string name;
    Subject[]|SubjectGoal[] subjects = <Subject[]> [];
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
    Lesson[]? lessons;
|};

public type Subject record {|
    readonly string id;
    string name;
    Lesson[] lessons;
|};

public type SubjectGoal record {|
    *Subject;
    decimal goalHours = 0;
    decimal actualHours = 0;
|};

public type Lesson record {|
    readonly string id;
    string name;
    int no;
|};

public type NotFoundError record {|
    *http:NotFound;
|};

public type UnauthorizedError record {|
    *http:Unauthorized;
|};

public type BadRequestError record {|
    *http:BadRequest;
|};

public type InternalServerError record {|
    *http:InternalServerError;
|};

public type SuccessMessage record {|
    *http:Ok;
|};
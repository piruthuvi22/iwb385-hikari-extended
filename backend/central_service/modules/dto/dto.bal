public type User record {|
    readonly string id;
    string name;
    string email;
    UserSubject[] subjectIds = [];
    ID[] followersIds = [];
    ID[] followingIds = [];
    ID[] requestedIds = [];
    ID[] requestedByIds = [];
    boolean isDeleted = false;
|};

public type UserInsert record {|
    string name;
    string email;
|};

public type UserSubject record {|
    readonly string id;
    decimal goalHours;
|};

public type Subject record {|
    readonly string id;
    string name;
    decimal goalHours = 0;
    decimal actualHours = 0;
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
    decimal goalHours ;
    decimal actualHours;
|};

public type StudySession record {|
    string subjectId;
    string lessonId;
    int noMins;
|};

public type ID record {|
    string id;
|};

# Description.
# Scenario: User A follows User B (Based on Insta)
# + following - User A  
# + follower - User B
public type Follow record {|
    ID following;
    ID follower;
|};

# Description.
# Scenario: User A requests User B
# + requested - User B 
# + requestedBy - User A
public type Request record {|
    ID requested;
    ID requestedBy;
|};

public type GoalAdjust record {|
    string subjectId;
    decimal goalHours;
|};
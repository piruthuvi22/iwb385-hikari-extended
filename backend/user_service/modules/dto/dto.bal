public type User record {|
    readonly string id;
    SubjectGoal[] subjectIds = [];
    boolean isDeleted = false;
|};

public type IDInput record {|
    ID newId;
|};

public type SubjectIdDto record {|
    SubjectGoal subject;
|};

public type ID record {|
    string id;
|};

public type SubjectGoal record {|
    string id;
    decimal goalHours = 0;
|};

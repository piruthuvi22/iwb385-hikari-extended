import user_service.models;

public type User record {|
    readonly string id;
    models:SubjectGoal[] subjectIds = [];
    boolean isDeleted = false;
|};

public type IDInput record {|
    models:ID newId;
|};

public type SubjectIdDto record {|
    models:SubjectGoal subject;
|};

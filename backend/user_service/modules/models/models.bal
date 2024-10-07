public type User record {|
    readonly string id;
    string name;
    string email;
    SubjectGoal[] subjectIds = [];
    ID[] followersIds = [];
    ID[] followingIds = [];
    ID[] requestedIds = [];
    ID[] requestedByIds = [];
    boolean isDeleted = false;
|};

public type ID record {|
    string id;
|};

public type SubjectGoal record {|
    string id;
    decimal goalHours = 0;
|};

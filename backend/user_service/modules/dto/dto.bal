public type User record {|
    readonly string id;
    string name;
    string email;
|};

public type UserSubject record {|
    *User;
    SubjectGoal[] subjectIds = [];
    boolean isDeleted = false;
|};

public type Id record {|
    ID newId;
|};

public type SubjectId record {|
    SubjectGoal subject;
|};

public type ID record {|
    string id;
|};

public type SubjectGoal record {|
    string id;
    decimal goalHours = 0;
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

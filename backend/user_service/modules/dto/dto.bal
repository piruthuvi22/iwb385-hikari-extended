import user_service.models;

public type User record {|
    readonly string id;
    string name;
    string email;
    models:SubjectGoal[] subjectIds = [];
    boolean isDeleted = false;
|};

public type Id record {|
    models:ID newId;
|};

public type SubjectId record {|
    models:SubjectGoal subject;
|};

# Description.
# Scenario: User A follows User B (Based on Insta)
# + following - User A  
# + follower - User B
public type Follow record {|
    models:ID following;
    models:ID follower;
|};

# Description.
# Scenario: User A requests User B
# + requested - User B 
# + requestedBy - User A
public type Request record {|
    models:ID requested;
    models:ID requestedBy;
|};

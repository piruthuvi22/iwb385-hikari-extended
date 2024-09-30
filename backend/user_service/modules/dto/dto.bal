import user_service.models;

public type UserInput record {|
    string name;
    string email;
    models:Role role;
|};

public type SubjectInput record {|
    string[] subject_ids;
|};

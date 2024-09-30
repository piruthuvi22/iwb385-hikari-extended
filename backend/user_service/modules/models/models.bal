public type User record {|
    readonly string id;
    string name;
    string email;
    string[] subject_ids?;
    string[] followers_ids?;
    string[] following_ids?;
    string[] requested_ids?;
    string[] requested_by_ids?;
    boolean is_deleted = false;
    string role;
|};

public enum Role {
    ADMIN,
    USER
};

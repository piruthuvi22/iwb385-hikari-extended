
public type Subject record {|
    readonly string id;
    string name;
    string studentId?; //do we need?
    int goalHours?; // should be in the user_service?
    Lesson[] lessons?;
    string weekId?; //what is mean by this?
    boolean isDeleted = false;
|};

public type Lesson record {|
    readonly string id;
    string name;
    int no;
    boolean isDeleted = false;
|};

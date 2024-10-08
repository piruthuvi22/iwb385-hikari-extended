public type Subject record {|
    readonly string id;
    string name;
    Lesson[] lessons = [];
|};

public type Lesson record {|
    readonly string id;
    string name;
    int no;
|};

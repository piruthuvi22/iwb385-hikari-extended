import subject_service.dto;
import subject_service.models;

import ballerina/http;
// import ballerina/io;
import ballerina/uuid;
import ballerinax/mongodb;

configurable string DATABASE_NAME = ?;
configurable string CONNECTION_URL = ?;

mongodb:Client mongoDb = check new ({
    connection: CONNECTION_URL
});

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowCredentials: false,
        allowHeaders: ["CORELATION_ID"],
        exposeHeaders: ["X-CUSTOM-HEADER"],
        maxAge: 84900
    }
}

service /api on new http:Listener(9092) {
    private final mongodb:Database db;

    @http:ResourceConfig {
        cors: {
            allowOrigins: ["*"],
            allowCredentials: true,
            allowHeaders: ["Authorization", "Content-Type"],
            allowMethods: ["GET", "POST", "PUT", "DELETE"]
        }
    }

    function init() returns error? {
        self.db = check mongoDb->getDatabase(DATABASE_NAME);
    }

    resource function get subjects() returns models:Subject[]|error? {
        mongodb:Collection subjects = check self.db->getCollection("subjects");
        stream<models:Subject, error?> resultStream = check subjects->find();
        models:Subject[]|error result = from models:Subject subject in resultStream
            select subject;
        return result;
    }

    resource function get subjects/[string id]() returns models:Subject|error? {
        mongodb:Collection subjects = check self.db->getCollection("subjects");
        models:Subject|error? selectedSubject = check subjects->findOne({id});
        if selectedSubject !is models:Subject {
            return error(string `Failed to fetch subject with id ${id}`);
        }
        return selectedSubject;
    }

    resource function post subjects(dto:SubjectDto subjectDto) returns models:Subject|error? {
        mongodb:Collection subjects = check self.db->getCollection("subjects");
        models:Subject|error? existingSubject = check subjects->findOne({"name": subjectDto.name});
        if existingSubject is models:Subject {
            return error(string `Subject ${subjectDto.name}  is already added`);
        }

        models:Subject newSubject = {
            id: uuid:createType1AsString(),
            name: subjectDto.name
        };
        check subjects->insertOne(newSubject);
        return newSubject;
    }
    //need to implement delete subject and lessons
}

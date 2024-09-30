import user_service.dto;
import user_service.models;

import ballerina/http;
import ballerina/io;
import ballerina/uuid;
import ballerinax/mongodb;

final mongodb:Client mongoDb = check new ({
    connection: {
        serverAddress: {
            host: "localhost",
            port: 27017
        }
    }
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
        self.db = check mongoDb->getDatabase("StRings");
    }

    resource function get users() returns models:User[]|error {
        mongodb:Collection users = check self.db->getCollection("users");
        stream<models:User, error?> resultStream = check users->find({role: "USER"});
        models:User[]|error result = from models:User user in resultStream
            select user;

        io:println("Users: ", result);
        return result;
    }

    // resource function get users/[string _id]() returns models:User|error? {
    //     return getUser(self.db, _id);
    // }

    resource function post users(dto:UserInput user) returns error? {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User newUser = {
            id: uuid:createType1AsString(),
            name: user.name,
            email: user.email,
            role: user.role
        };
        return check users->insertOne(newUser);
    }

    // resource function delete users/[string id]() returns string|error? {
    //     mongodb:Collection users = check self.db->getCollection("users");
    //     mongodb:DeleteResult deleteResult = check users->deleteOne({id});
    //     if deleteResult.deletedCount != 1 {
    //         return error(string `Failed to delete the user with id ${id}`);
    //     }
    //     return id;
    // }

    // resource function put users/[string id]/subjects(dto:SubjectInput newSubjectIds) returns models:User|error? {
    //     mongodb:Collection users = check self.db->getCollection("users");
    //     mongodb:UpdateResult updateResult = check users->updateOne({id}, {"$push": {"subject_ids": {"$each": newSubjectIds}}});
    //     if updateResult.modifiedCount != 1 {
    //         return error(string `Failed to update the user with id ${id}`);
    //     }
    //     return check getUser(self.db, id);
    // }

}

// isolated function getUser(mongodb:Database db, string id) returns models:User|error? {
//     mongodb:Collection users = check db->getCollection("users");
//     models:User|error? selectedUser = check users->findOne({id});
//     if selectedUser is models:User {
//         return selectedUser;
//     } else {
//         return error(string `Failed to find a User with id ${id}`);
//     }
// }

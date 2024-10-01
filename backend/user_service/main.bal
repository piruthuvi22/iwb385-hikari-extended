import user_service.dto;
import user_service.models;

import ballerina/http;
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

    resource function get users() returns models:User[]|error {
        mongodb:Collection users = check self.db->getCollection("users");
        stream<models:User, error?> resultStream = check users->find();
        models:User[]|error result = from models:User user in resultStream
            select user;
        return result;
    }

    resource function get users/[string id]() returns models:User|error? {
        return getUser(self.db, id);
    }

    resource function delete users/[string id]() returns string|error? {
        mongodb:Collection users = check self.db->getCollection("users");
        mongodb:UpdateResult updateResult = check users->updateOne({id}, {set: {"isDeleted": true}});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to delete the user with id ${id}`);
        }
        return id;
    }

    resource function put users/[string id]/subjects(dto:IDInput newSubjectId) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user is error {
            return user;
        }
        models:ID[] updatedIds = [];
        if user is models:User {
            updatedIds = user.subjectIds;
            updatedIds.push(newSubjectId.newId);
        }
        mongodb:UpdateResult updateResult = check users->updateOne({id}, {set: {"subjectIds": updatedIds}});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to update the user with id ${id}`);
        }
        return check getUser(self.db, id);
    }

    resource function put users/[string id]/followers(dto:IDInput newFollowersId) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user is error {
            return user;
        }
        models:ID[] updatedIds = [];
        if user is models:User {
            updatedIds = user.followersIds;
            updatedIds.push(newFollowersId.newId);
        }
        mongodb:UpdateResult updateResult = check users->updateOne({id}, {set: {"followersIds": updatedIds}});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to update the user with id ${id}`);
        }
        return check getUser(self.db, id);
    }

    resource function put users/[string id]/following(dto:IDInput newFollowingId) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user is error {
            return user;
        }
        models:ID[] updatedIds = [];
        if user is models:User {
            updatedIds = user.followingIds;
            updatedIds.push(newFollowingId.newId);
        }
        mongodb:UpdateResult updateResult = check users->updateOne({id}, {set: {"followingIds": updatedIds}});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to update the user with id ${id}`);
        }
        return check getUser(self.db, id);
    }

    resource function put users/[string id]/requested(dto:IDInput newRequestedId) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user is error {
            return user;
        }
        models:ID[] updatedIds = [];
        if user is models:User {
            updatedIds = user.requestedIds;
            updatedIds.push(newRequestedId.newId);
        }
        mongodb:UpdateResult updateResult = check users->updateOne({id}, {set: {"requestedIds": updatedIds}});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to update the user with id ${id}`);
        }
        return check getUser(self.db, id);
    }

    resource function put users/[string id]/requestedBy(dto:IDInput newRequestedById) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user is error {
            return user;
        }
        models:ID[] updatedIds = [];
        if user is models:User {
            updatedIds = user.requestedByIds;
            updatedIds.push(newRequestedById.newId);
        }
        mongodb:UpdateResult updateResult = check users->updateOne({id}, {set: {"requestedByIds": updatedIds}});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to update the user with id ${id}`);
        }
        return check getUser(self.db, id);
    }
}

isolated function getUser(mongodb:Database db, string id) returns models:User|error? {
    mongodb:Collection users = check db->getCollection("users");
    models:User|error? selectedUser = check users->findOne({id});
    if selectedUser is models:User {
        return selectedUser;
    } else if selectedUser !is error {
        return postUser(db, id);
    }
    return selectedUser;
}

isolated function postUser(mongodb:Database db, string id) returns models:User|error? {
    mongodb:Collection users = check db->getCollection("users");
    models:User newUser = {
        id: id
    };
    mongodb:Error? err = check users->insertOne(newUser);
    if err is mongodb:Error {
        return err;
    }
    return getUser(db, id);
}

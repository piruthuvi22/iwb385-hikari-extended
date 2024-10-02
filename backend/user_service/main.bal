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
        if user is models:User {
            return addSubject(user.subjectIds, newSubjectId.newId, users, id, "subjectIds", self.db);
        }
        return user;
    }

    resource function put users/[string id]/followers(dto:IDInput newFollowersId) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user is models:User {
            return addSubject(user.followersIds, newFollowersId.newId, users, id, "followersIds", self.db);
        }
        return user;
    }

    resource function put users/[string id]/following(dto:IDInput newFollowingId) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user is models:User {
            return addSubject(user.followingIds, newFollowingId.newId, users, id, "followingIds", self.db);
        }
        return user;
    }

    resource function put users/[string id]/requested(dto:IDInput newRequestedId) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user is models:User {
            return addSubject(user.requestedIds, newRequestedId.newId, users, id, "requestedIds", self.db);
        }
        return user;
    }

    resource function put users/[string id]/requestedBy(dto:IDInput newRequestedById) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user is models:User {
            return addSubject(user.requestedByIds, newRequestedById.newId, users, id, "requestedByIds", self.db);
        }
        return user;
    }

    resource function delete users/[string id]/subjects(dto:IDInput toBeDeletedId) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user is models:User {
            return deleteSubject(user.subjectIds, toBeDeletedId.newId, users, id, "subjectIds", self.db);
        }
        return user;
    }

    resource function delete users/[string id]/followers(dto:IDInput toBeDeletedId) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user is models:User {
            return deleteSubject(user.followersIds, toBeDeletedId.newId, users, id, "followersIds", self.db);
        }
        return user;
    }

    resource function delete users/[string id]/following(dto:IDInput toBeDeletedId) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user is models:User {
            return deleteSubject(user.followingIds, toBeDeletedId.newId, users, id, "followingIds", self.db);
        }
        return user;
    }

    resource function delete users/[string id]/requested(dto:IDInput toBeDeletedId) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user is models:User {
            return deleteSubject(user.requestedIds, toBeDeletedId.newId, users, id, "requestedIds", self.db);
        }
        return user;
    }

    resource function delete users/[string id]/requestedBy(dto:IDInput toBeDeletedId) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user is models:User {
            return deleteSubject(user.requestedByIds, toBeDeletedId.newId, users, id, "requestedByIds", self.db);
        }
        return user;
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

isolated function addSubject(models:ID[] exisitingIds, models:ID newId, mongodb:Collection users, string id, string idName, mongodb:Database db) returns models:User|error? {
    int index = exisitingIds.indexOf(newId) ?: -1;
    if index > -1 {
        return error(string `Subject with id ${newId.id} is already added`);
    }
    exisitingIds.push(newId);
    map<json> updateField = {};
    updateField[idName] = exisitingIds;
    mongodb:UpdateResult updateResult = check users->updateOne({id}, {set: updateField});
    if updateResult.modifiedCount != 1 {
        return error(string `Failed to update the user with id ${id}`);
    }
    return check getUser(db, id);
}

isolated function deleteSubject(models:ID[] exisitingIds, models:ID newId, mongodb:Collection users, string id, string idName, mongodb:Database db) returns models:User?|error {
    if exisitingIds.length() == 0 {
        return error(string `No subject ids found`);
    }
    int? index = exisitingIds.indexOf(newId);
    if (index > -1) {
        models:ID _ = exisitingIds.remove(index ?: -1);
    } else {
        return error(string `Failed to find subject id with the id ${newId.id}`);
    }

    map<json> updateField = {};
    updateField[idName] = exisitingIds;
    mongodb:UpdateResult updateResult = check users->updateOne({id}, {set: updateField});
    if updateResult.modifiedCount != 1 {
        return error(string `Failed to update the user with id ${id}`);
    }
    return check getUser(db, id);
}

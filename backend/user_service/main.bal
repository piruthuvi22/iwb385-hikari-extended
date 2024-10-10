import user_service.dto;
import user_service.models;

import ballerina/http;
import ballerinax/mongodb;

configurable string DATABASE_NAME = ?;
configurable string CONNECTION_URL = ?;

mongodb:Client mongoDb = check new ({
    connection: CONNECTION_URL
});

service /api on new http:Listener(9090) {
    private final mongodb:Database db;

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

    resource function get users/[string ids]() returns models:User|models:User[]|error? {
        string[] idArray = re `,`.split(ids);
        if idArray.length() == 1 {
            return getUser(self.db, idArray[0]);
        }
        mongodb:Collection users = check self.db->getCollection("users");
        stream<models:User, error?> resultStream = check users->find();
        models:User[]|error result = from models:User user in resultStream
            where idArray.indexOf(user.id) > -1
            select user;
        return result;
    }

    resource function get users/search(string searchItem) returns dto:User[]|error? {
        mongodb:Collection users = check self.db->getCollection("users");
        map<json> query = {};
        if (searchItem == "") {
            return error(string `Search query is empty`);
        }
        query = {name: {"$regex": searchItem, "$options": "i"}};
        stream<dto:User, error?> resultStream = check users->find(query);
        dto:User[]|error result = from dto:User user in resultStream
            limit 10
            select user;
        return result;
    }

    resource function post users(dto:User user) returns models:User|error? {
        return postUser(self.db, user);
    }

    resource function delete users/[string id]() returns string|error? {
        mongodb:Collection users = check self.db->getCollection("users");
        mongodb:UpdateResult updateResult = check users->updateOne({id}, {set: {"isDeleted": true}});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to delete the user with id ${id}`);
        }
        return id;
    }

    resource function put users/[string id]/subjects(dto:SubjectId subjectDto) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user !is models:User {
            return user;
        }
        models:SubjectGoal[] updateId = user.subjectIds;
        foreach models:SubjectGoal item in updateId {
            if item.id == subjectDto.subject.id {
                return error(string `Subject with id ${subjectDto.subject.id} is already added`);
            }
        }
        updateId.push(subjectDto.subject);
        mongodb:UpdateResult updateResult = check users->updateOne({id}, {set: {"subjectIds": updateId}});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to update the user with id ${id}`);
        }
        return check getUser(self.db, id);
    }

    resource function put users/[string id]/subjects/goals(dto:SubjectId subjectDto) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user !is models:User {
            return user;
        }
        models:SubjectGoal[] updateGoalHours = user.subjectIds;
        foreach models:SubjectGoal item in updateGoalHours {
            if item.id == subjectDto.subject.id {
                item.goalHours = subjectDto.subject.goalHours;
            }
        }
        _ = check users->updateOne({id}, {set: {"subjectIds": updateGoalHours}});
        return check getUser(self.db, id);
    }

    resource function put users/follow(dto:Follow follow) returns boolean|error {
        dto:Request request = {
            requested: follow.follower,
            requestedBy: follow.following
        };
        boolean|error? isRequestDeleted = deleteRequest(self.db, request);
        if isRequestDeleted is error || (isRequestDeleted is boolean && !isRequestDeleted) {
            return isRequestDeleted;
        }

        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? followerUser = check getUser(self.db, follow.follower.id);
        if followerUser !is models:User {
            return error(string `User with id ${follow.follower.id} not found`);
        }
        models:User|error? updatedFollower = addId(followerUser.followersIds, follow.following, users, follow.follower.id, "followersIds", self.db);
        if updatedFollower !is models:User {
            return error(string `Failed to update follower details to user with id ${follow.follower.id}`);
        }
        models:User|error? followingUser = check getUser(self.db, follow.following.id);
        if followingUser !is models:User {
            return error(string `User with id ${follow.following.id} not found`);
        }
        models:User|error? updatedFollowing = addId(followingUser.followingIds, follow.follower, users, follow.following.id, "followingIds", self.db);
        if updatedFollowing is models:User {
            return true;
        }
        return false;
    }

    resource function put users/requests(dto:Request request) returns boolean|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? requestedUser = check getUser(self.db, request.requested.id);
        if requestedUser !is models:User {
            return error(string `User with id ${request.requested.id} not found`);
        }
        models:User|error? updatedRequested = addId(requestedUser.requestedByIds, request.requestedBy, users, request.requested.id, "requestedByIds", self.db);
        if updatedRequested !is models:User {
            return error(string `Failed to update requested details to user with id ${request.requested.id}`);
        }
        models:User|error? requestedByUser = check getUser(self.db, request.requestedBy.id);
        if requestedByUser !is models:User {
            return error(string `User with id ${request.requestedBy.id} not found`);
        }
        models:User|error? updatedRequestedBy = addId(requestedByUser.requestedIds, request.requested, users, request.requestedBy.id, "requestedIds", self.db);
        if updatedRequestedBy is models:User {
            return true;
        }
        return false;
    }

    resource function delete users/[string id]/subjects(dto:SubjectId subjectDto) returns models:User?|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? user = check getUser(self.db, id);
        if user !is models:User {
            return user;
        }
        models:SubjectGoal[] updateId = user.subjectIds;
        if updateId.length() == 0 {
            return error(string `No subject ids found`);
        }
        foreach int i in 0 ... (updateId.length() - 1) {
            if (updateId[i].id == subjectDto.subject.id) {
                models:SubjectGoal _ = updateId.remove(i);
                break;
            }
        }

        mongodb:UpdateResult updateResult = check users->updateOne({id}, {set: {"subjectIds": updateId}});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to update the user with id ${id}`);
        }
        return check getUser(self.db, id);
    }

    resource function delete users/follow(dto:Follow toBeDeleted) returns boolean|error {
        mongodb:Collection users = check self.db->getCollection("users");
        models:User|error? followerUser = check getUser(self.db, toBeDeleted.follower.id);
        if followerUser !is models:User {
            return error(string `User with id ${toBeDeleted.follower.id} not found`);
        }
        models:User|error? updatedFollower = deleteId(followerUser.followersIds, toBeDeleted.following, users, toBeDeleted.follower.id, "followersIds", self.db);
        if updatedFollower !is models:User {
            return error(string `Failed to update follower details to user with id ${toBeDeleted.follower.id}`);
        }
        models:User|error? followingUser = check getUser(self.db, toBeDeleted.following.id);
        if followingUser !is models:User {
            return error(string `User with id ${toBeDeleted.following.id} not found`);
        }
        models:User|error? updatedFollowing = deleteId(followingUser.followingIds, toBeDeleted.follower, users, toBeDeleted.following.id, "followingIds", self.db);
        if updatedFollowing is models:User {
            return true;
        }
        return false;
    }

    resource function delete users/requests(dto:Request toBeDeleted) returns boolean|error {
        return deleteRequest(self.db, toBeDeleted);
    }
}

isolated function getUser(mongodb:Database db, string id) returns models:User|error? {
    mongodb:Collection users = check db->getCollection("users");
    models:User|error? selectedUser = check users->findOne({id, "isDeleted": false});
    if selectedUser is models:User {
        return selectedUser;
    }
    return error(string `User with id ${id} not found`);
}

isolated function postUser(mongodb:Database db, dto:User user) returns models:User|error? {
    mongodb:Collection users = check db->getCollection("users");
    models:User|error? existingUser = getUser(db, user.id);
    if existingUser is models:User {
        return error(string `User with id ${user.id} already exists`);
    }

    models:User newUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };
    mongodb:Error? err = check users->insertOne(newUser);
    if err is mongodb:Error {
        return err;
    }
    return getUser(db, user.id);
}

isolated function addId(models:ID[] exisitingIds, models:ID newId, mongodb:Collection users, string userId, string idName, mongodb:Database db) returns models:User|error? {
    int index = exisitingIds.indexOf(newId) ?: -1;
    if index > -1 {
        return error(string `Subject with id ${newId.id} is already added`);
    }
    exisitingIds.push(newId);
    map<json> updateField = {};
    updateField[idName] = exisitingIds;
    mongodb:UpdateResult updateResult = check users->updateOne({id: userId}, {set: updateField});
    if updateResult.modifiedCount != 1 {
        return error(string `Failed to update the user with id ${userId}`);
    }
    return check getUser(db, userId);
}

isolated function deleteId(models:ID[] exisitingIds, models:ID newId, mongodb:Collection users, string userId, string idName, mongodb:Database db) returns models:User?|error {
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
    mongodb:UpdateResult updateResult = check users->updateOne({id: userId}, {set: updateField});
    if updateResult.modifiedCount != 1 {
        return error(string `Failed to update the user with id ${userId}`);
    }
    return check getUser(db, userId);
}

isolated function deleteRequest(mongodb:Database db, dto:Request toBeDeleted) returns boolean|error {
    mongodb:Collection users = check db->getCollection("users");
    models:User|error? requestedUser = check getUser(db, toBeDeleted.requested.id);
    if requestedUser !is models:User {
        return error(string `User with id ${toBeDeleted.requested.id} not found`);
    }
    models:User|error? updatedRequested = deleteId(requestedUser.requestedByIds, toBeDeleted.requestedBy, users, toBeDeleted.requested.id, "requestedByIds", db);
    if updatedRequested !is models:User {
        return error(string `Failed to update requested details to user with id ${toBeDeleted.requested.id}`);
    }
    models:User|error? requestedByUser = check getUser(db, toBeDeleted.requestedBy.id);
    if requestedByUser !is models:User {
        return error(string `User with id ${toBeDeleted.requestedBy.id} not found`);
    }
    models:User|error? updatedRequestedBy = deleteId(requestedByUser.requestedIds, toBeDeleted.requested, users, toBeDeleted.requestedBy.id, "requestedIds", db);
    if updatedRequestedBy is models:User {
        return true;
    }
    return false;
}


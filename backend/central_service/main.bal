import central_service.dto;
import central_service.response;

import ballerina/http;
import ballerina/jwt;
import ballerina/io;

configurable string OAUTH2 = ?;
configurable string USER_SERVICE = ?;
configurable string SUBJECT_SERVICE = ?;
configurable string STUDY_SERVICE = ?;

listener central = new http:Listener(9094);

isolated http:Client userClient = check new (USER_SERVICE);
isolated http:Client subjectClient = check new (SUBJECT_SERVICE);
isolated http:Client studyClient = check new (STUDY_SERVICE);

const string JWT_VALIDATION_FAILED = "JWT validation failed";

final response:SuccessMessage & readonly SUCCESS_MESSAGE = {body: {message: "Success"}};

enum UserDetailLevel {
    NAME,
    FULL
}

http:ListenerAuthConfig[] auth_config = [
    {
        jwtValidatorConfig: {
            issuer: OAUTH2,
            audience: "central_api",
            signatureConfig: {
                jwksConfig: {
                    url: OAUTH2 + ".well-known/jwks.json"
                }
            }
        },
        scopes: ["openid", "profile", "email"]
    }
];

service class ResponseErrorInterceptor {
    *http:ResponseErrorInterceptor;

    remote function interceptResponseError(error err) returns http:Unauthorized|http:InternalServerError|http:BadRequest {

        if err.toString() ==  string `error InternalListenerAuthnError ("")` {
            http:Unauthorized unauthorizedError = {body: {message: "Authentication Failed"}};
            return unauthorizedError;
        }

        if err.toString().startsWith("error InternalPayloadBindingListenerError") {
            response:BadRequestError badRequestError = {body: {message: "Bad Request", details: err.message()}};
            return badRequestError;
        }

        io:println(err.toBalString());

        response:InternalServerError internalServerError = {body: {message: "Oops! Something went wrong :(", details: err.message()}};

        return internalServerError;
    }
}

@http:ServiceConfig {
    auth: auth_config,
    cors: {
        allowOrigins: ["*"]
    }
}
service http:InterceptableService /central/api/users on central {

    public function createInterceptors() returns ResponseErrorInterceptor {
        return new ResponseErrorInterceptor();
    }

    isolated resource function get .(http:RequestContext ctx) returns response:UserDetails|http:Unauthorized|http:NotFound|error {

        string|http:Unauthorized userId = getUserSub(ctx);
        if userId is http:Unauthorized {
            return userId;
        }

        dto:User|http:NotFound user = check getUser(userId);
        if user is http:NotFound {
            return user;
        }

        response:UserDetails userDto = {id: user.id, email: user.email, name: user.name};

        if user.subjectIds.length() == 0 {
            return userDto;
        }

        string subjectIds = from var subject in user.subjectIds
            select subject.id + ",";

        subjectIds = subjectIds.substring(0, subjectIds.length() - 1);
        response:Subject|response:Subject[] subjects;

        lock {
            subjects = check subjectClient->get("api/subjects/" + subjectIds);
        }

        if subjects is response:Subject {
            userDto.subjects = [subjects];
        } else {
            userDto.subjects = subjects;
        }

        return userDto;
    }

    isolated resource function get search/[string search] () returns response:User[]|error {

        response:User[]|error users;
        lock {
            users = check userClient->get("api/users/search?searchItem=" + search);
        }
        return users;

    } 

    isolated resource function post .(dto:UserInsert userDto) returns response:UserDetails|http:Unauthorized|http:BadRequest|error {

        dto:User|error user;
        lock {
            user = userClient->post("api/users", userDto.cloneReadOnly());
        }

        if user is error {
            if user.toString().includes(string `"message":"User with id ${userDto.id} already exists"`) {
                response:BadRequestError badRequestError = {body: {message: "User already exists"}};
                return badRequestError;
            }
            return user;
        }

        return {id: user.id, email: user.email, name: user.name};

    }

    isolated resource function get friends(http:RequestContext ctx) returns response:Friends|http:NotFound|http:Unauthorized|error {

        string|http:Unauthorized userId = getUserSub(ctx);
        if userId is http:Unauthorized {
            return userId;
        }

        return getFriends(userId);
    }

    // To make a friend request
    isolated resource function put friend\-request(http:RequestContext ctx, dto:ID friend) returns response:Friends|http:NotFound|http:Unauthorized|error {

        string|http:Unauthorized userId = getUserSub(ctx);
        if userId is http:Unauthorized {
            return userId;
        }

        lock {
            _ = check userClient->put("api/users/requests", {requestedBy: {id: userId}, requested: friend.cloneReadOnly()}, targetType = boolean);
        }
        return getFriends(userId);
    }

    // To accept a friend request
    isolated resource function put accept\-friend\-request(http:RequestContext ctx, dto:ID friend) returns response:Friends|http:NotFound|http:Unauthorized|error {

        string|http:Unauthorized userId = getUserSub(ctx);
        if userId is http:Unauthorized {
            return userId;
        }

        lock {
            _ = check userClient->put("api/users/follow", {follower: {id: userId}, following: friend.cloneReadOnly()}, targetType = boolean);
        }
        return getFriends(userId);
    }

    // To revoke a friend request
    isolated resource function delete friend\-request(http:RequestContext ctx, dto:ID friend) returns response:Friends|http:NotFound|http:Unauthorized|error {

        string|http:Unauthorized userId = getUserSub(ctx);
        if userId is http:Unauthorized {
            return userId;
        }

        lock {
            _ = check userClient->delete("api/users/requests", {requestedBy: {id: userId}, requested: friend.cloneReadOnly()}, targetType = boolean);
        }
        return getFriends(userId);
    }

    // To unfollow a friend
    isolated resource function delete follow\-friend(http:RequestContext ctx, dto:ID friend) returns response:Friends|http:NotFound|http:Unauthorized|error {

        string|http:Unauthorized userId = getUserSub(ctx);
        if userId is http:Unauthorized {
            return userId;
        }

        lock {
            _ = check userClient->delete("api/users/follow", {follower: friend.cloneReadOnly(), following: {id: userId}}, targetType = boolean);
        }
        return getFriends(userId);
    }

    // To reject a friend request
    isolated resource function delete reject\-friend\-request(http:RequestContext ctx, dto:ID friend) returns response:Friends|http:NotFound|http:Unauthorized|error {

        string|http:Unauthorized userId = getUserSub(ctx);
        if userId is http:Unauthorized {
            return userId;
        }

        lock {
            _ = check userClient->delete("api/users/requests", {requestedBy: friend.cloneReadOnly(), requested: {id: userId}}, targetType = boolean);
        }
        return getFriends(userId);
    }

    // To remove a follower
    isolated resource function delete friend\-follower(http:RequestContext ctx, dto:ID friend) returns response:Friends|http:NotFound|http:Unauthorized|error {

        string|http:Unauthorized userId = getUserSub(ctx);
        if userId is http:Unauthorized {
            return userId;
        }

        lock {
            _ = check userClient->delete("api/users/follow", {follower: {id: userId}, following: friend.cloneReadOnly()}, targetType = boolean);
        }
        return getFriends(userId);
    }

}

@http:ServiceConfig {
    auth: auth_config,
    cors: {
        allowOrigins: ["*"]
    }
}
service http:InterceptableService /central/api/subjects on central {

    public function createInterceptors() returns ResponseErrorInterceptor {
        return new ResponseErrorInterceptor();
    }

    isolated resource function get .() returns response:Subject[]|error {
        lock {
            return subjectClient->get("api/subjects");
        }
    }

    isolated resource function put .(http:RequestContext ctx, dto:ID subject) returns http:Ok|http:Unauthorized|error {

        string|http:Unauthorized userId = getUserSub(ctx);
        if userId is http:Unauthorized {
            return userId;
        }

        lock {
            _ = check userClient->put("api/users/" + userId + "/subjects/", {subject: subject.cloneReadOnly()}, targetType = anydata);
        }
        return SUCCESS_MESSAGE;
    }

    isolated resource function put goals(http:RequestContext ctx, dto:GoalAdjust goalAdjust) returns http:Ok|http:Unauthorized|error {

        string|http:Unauthorized userId = getUserSub(ctx);
        if userId is http:Unauthorized {
            return userId;
        }

        if goalAdjust.goalHours < <decimal>0 {
            return error("Goal hours cannot be negative");
        }
        http:Response res;
        lock {
            res = check userClient->put("api/users/" + userId + "/subjects" + "/goals", {subject: {goalHours: goalAdjust.goalHours, id: goalAdjust.subjectId}});
        }
        if (res.statusCode != 200) {
            return error("Failed to update goal hours");
        }
        lock {
            res = check studyClient->put("api/adjust-weekly-goal", {studentId: userId, subjectId: goalAdjust.subjectId, goalHours: goalAdjust.goalHours});
        }
        return SUCCESS_MESSAGE;
    }

    isolated resource function delete .(http:RequestContext ctx, dto:ID subject) returns http:Ok|http:Unauthorized|error {

        string|http:Unauthorized userId = getUserSub(ctx);
        if userId is http:Unauthorized {
            return userId;
        }

        lock {
            _ = check userClient->delete("api/users/" + userId + "/subjects", {subject: subject.cloneReadOnly()}, targetType = anydata);
        }
        return SUCCESS_MESSAGE;
    }

    isolated resource function get [string subjectId](http:RequestContext ctx) returns response:StudyStatus|http:Unauthorized|http:NotFound|http:BadRequest|error {

        string|http:Unauthorized userId = getUserSub(ctx);
        if userId is http:Unauthorized {
            return userId;
        }

        return check getStudyDetails(userId, subjectId);
    }

    isolated resource function get [string subjectId]/[int year]/[int weekNo](http:RequestContext ctx) returns response:StudyStatus|http:Unauthorized|http:NotFound|http:BadRequest|error {

        string|http:Unauthorized userId = getUserSub(ctx);
        if userId is http:Unauthorized {
            return userId;
        }

        return check getStudyDetails(userId, subjectId, year, weekNo);
    }

}

@http:ServiceConfig {
    auth: auth_config,
    cors: {
        allowOrigins: ["*"]
    }
}
service http:InterceptableService /central/api/study on central {

    public function createInterceptors() returns ResponseErrorInterceptor {
        return new ResponseErrorInterceptor();
    }

    isolated resource function post .(http:RequestContext ctx, dto:StudySession studySession) returns response:StudyStatus|http:Unauthorized|http:NotFound|http:BadRequest|error {

        string|http:Unauthorized userId = getUserSub(ctx);
        if userId is http:Unauthorized {
            return userId;
        }

        dto:User|http:NotFound user = check getUser(userId);
        if user is http:NotFound {
            return user;
        }

        decimal[] goalHours = from var subject in user.subjectIds
            where subject.id == studySession.subjectId
            select subject.goalHours;

        lock {
            _ = check studyClient->post("api/study-session/", {...studySession.cloneReadOnly(), studentId: userId, goalHours: goalHours[0]}, targetType = http:Response);
        }
        return getStudyDetails(userId, studySession.subjectId);
    }

}

isolated function getUserSub(http:RequestContext ctx) returns string|http:Unauthorized {
    [jwt:Header, jwt:Payload]|error jwtInfo = ctx.getWithType(http:JWT_INFORMATION);
    if jwtInfo is error {
        response:UnauthorizedError unauthorizedError = {body: {message: JWT_VALIDATION_FAILED}};
        return unauthorizedError;
    }
    return jwtInfo[1].sub.toString().substring(6);
}

isolated function getUser(string userId) returns dto:User|http:NotFound|error {
    dto:User|http:ApplicationResponseError|error user;
    lock {
        user = userClient->get("api/users/" + userId);
    }
    if user is error {
        if user.toString().includes(string `"message":"User with id ${userId} not found"`) {
            response:NotFoundError notFoundError = {body: {message: "User not found"}};
            return notFoundError;
        }
    }
    return user;
}

isolated function getUsers(dto:ID[] usersObject, UserDetailLevel detailLevel = NAME) returns response:UserDetails[]|error {
    if (usersObject.length() == 0) {
        return [];
    }

    string userIds = from var user in usersObject
        select user.id + ",";

    userIds = userIds.substring(0, userIds.length() - 1);
    dto:User[]|dto:User users;
    lock {
        users = check userClient->get("api/users/" + userIds);
    }

    map<dto:UserStudySummary>? userStudySummaries = ();
    if detailLevel == FULL {
        lock {
            userStudySummaries = check studyClient->get("api/study-summary/" + userIds);
        }
    }
    response:UserDetails[] userDtos = [];
    if users is dto:User {
        response:UserDetails userDto = {id: users.id, email: users.email, name: users.name};
        if detailLevel == FULL {
            userDto.subjects = check getUserSubjectSummary(userDto, users.subjectIds, userStudySummaries);
        }
        userDtos.push(userDto);
        return userDtos;
    }
    foreach var user in users {
        response:UserDetails userDto = {id: user.id, email: user.email, name: user.name};
        if detailLevel == FULL {
            userDto.subjects = check getUserSubjectSummary(userDto, user.subjectIds, userStudySummaries);
        }
        userDtos.push(userDto);
    }
    return userDtos;
}

isolated function getUserSubjectSummary(response:UserDetails userDto, dto:UserSubject[] subjectIdList, map<dto:UserStudySummary>? userStudySummaries) returns response:SubjectGoal[]|error {

    string subjectIds = from var subject in subjectIdList
        select subject.id + ",";
    response:SubjectGoal[] subjects;
    lock {
        subjects = check subjectClient->get("api/subjects/" + subjectIds);
    }
    if userStudySummaries is map<dto:UserStudySummary> {
        dto:UserStudySummary studentSummary = userStudySummaries.get(userDto.id);
        foreach var subject in subjects {
            subject.actualHours = 0;
            foreach var subjectSummary in studentSummary.subjects {
                if (subject.id == subjectSummary.id) {
                    subject.actualHours = subjectSummary.actualHours;
                    break;
                }
            }
            foreach var subjectGoal in subjectIdList {
                if (subject.id == subjectGoal.id) {
                    subject.goalHours = subjectGoal.goalHours;
                    break;
                }
            }
        }
    }
    return subjects;
}

isolated function getFriends(string userId) returns response:Friends|http:NotFound|error {

    dto:User|http:NotFound user = check getUser(userId);

    if user is http:NotFound {
        return user;
    }

    response:Friends friends = {
        following: check getUsers(user.followingIds, FULL),
        followers: check getUsers(user.followersIds),
        requested: check getUsers(user.requestedIds),
        requestedBy: check getUsers(user.requestedByIds)
    };

    return friends;
}

isolated function getStudyDetails(string userId, string subjectId, int? year = (), int? weekNo = ()) returns response:StudyStatus|http:NotFound|http:BadRequest|error {

    dto:User|http:NotFound user = check getUser(userId);
    if user is http:NotFound {
        return user;
    }

    decimal? goalHours = 0;
    boolean found = false;
    foreach var subject in user.subjectIds {
        if (subject.id == subjectId) {
            goalHours = subject.goalHours;
            found = true;
            break;
        }
    }

    if !found {
        response:BadRequestError badRequestError = {body: {message: "User is not enrolled in the subject"}};
        return badRequestError;
    }

    dto:Subject subject;
    lock {
        subject = check subjectClient->get("api/subjects/" + subjectId);
    }
    dto:StudyStatus studyStatus;

    if year !is () && weekNo !is () {
        lock {
            studyStatus = check studyClient->get("api/study-status/" + userId + "/" + subjectId + "/" + year.toString() + "/" + weekNo.toString());
        }
        goalHours = studyStatus.goalHours;
    } else {
        lock {
            studyStatus = check studyClient->get("api/current-study-status/" + userId + "/" + subjectId);
        }
    }

    response:StudyStatus studyStatusDto = {
        studentId: userId,
        subjectId: subjectId,
        weekNo: studyStatus.weekNo,
        year: studyStatus.year,
        actualHours: studyStatus.actualHours,
        goalHours: goalHours,
        lessonDates: studyStatus.lessonDates,
        studiedLessons: studyStatus.studiedLessons,
        lessons: subject.lessons
    };
    return studyStatusDto;
}

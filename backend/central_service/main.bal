import central_service.dto;
import central_service.response;

import ballerina/http;
import ballerina/jwt;
// import ballerina/io;

configurable string OAUTH2 = ?;
configurable string USER_SERVICE = ?;
configurable string SUBJECT_SERVICE = ?;
configurable string STUDY_SERVICE = ?;

listener central = new http:Listener(9094);

http:Client userClient = check new (USER_SERVICE);
http:Client subjectClient = check new (SUBJECT_SERVICE);
http:Client studyClient = check new (STUDY_SERVICE);

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

@http:ServiceConfig {
    auth: auth_config
}
service /central/api/users on central {

    resource function get .(http:RequestContext ctx) returns response:UserDetails|error? {
        string userId = check getUserSub(ctx);
        dto:User user = check getUser(userId);
        response:UserDetails userDto = {id: user.id, email: user.email, name: user.name};
        if user.subjectIds.length() == 0 {
            return userDto;
        }
        string subjectIds = from var subject in user.subjectIds
            select subject.id + ",";

        subjectIds = subjectIds.substring(0, subjectIds.length() - 1);
        response:Subject|response:Subject[] subjects = check subjectClient->get("api/subjects/" + subjectIds);
        if subjects is response:Subject {
            userDto.subjects = [subjects];
        } else {
            userDto.subjects = subjects;
        }
        return userDto;
    }

    resource function post .(http:RequestContext ctx, dto:UserInsert userDto) returns error|response:UserDetails? {
        string userId = check getUserSub(ctx);
        dto:User user = check userClient->post("api/users", {id: userId, name: userDto.name, email: userDto.email});
        return {id: user.id, email: user.email, name: user.name};
    }

    resource function get friends(http:RequestContext ctx) returns response:Friends|error? {
        string userId = check getUserSub(ctx);
        dto:User user = check getUser(userId);
        response:Friends friends = {
            following: check getUsers(user.followingIds, FULL),
            followers: check getUsers(user.followersIds),
            requested: check getUsers(user.requestedIds),
            requestedBy: check getUsers(user.requestedByIds)
        };
        return friends;
    }

    // To make a friend request
    resource function put request(http:RequestContext ctx, string friendId) returns error? {
        string userId = check getUserSub(ctx);
        return check userClient->put("api/users/requests", {requestedBy: userId, requested: friendId});
    }

    // To accept a friend request
    resource function put accept\-request(http:RequestContext ctx, string friendId) returns error? {
        string userId = check getUserSub(ctx);
        return check userClient->put("api/users/follow", {follower: userId, following: friendId});
    }

    // To revoke a friend request
    resource function delete request(http:RequestContext ctx, string friendId) returns error? {
        string userId = check getUserSub(ctx);
        return check userClient->delete("api/users/requests", {requestedBy: userId, requested: friendId});
    }

    // To unfollow a friend
    resource function delete follow(http:RequestContext ctx, string friendId) returns error? {
        string userId = check getUserSub(ctx);
        return check userClient->delete("api/users/follow", {follower: userId, following: friendId});
    }

    // To reject a friend request
    resource function delete reject\-request(http:RequestContext ctx, string friendId) returns error? {
        string userId = check getUserSub(ctx);
        return check userClient->delete("api/users/requests", {requestedBy: friendId, requested: userId});
    }

    // To remove a follower
    resource function delete remove\-follower(http:RequestContext ctx, string friendId) returns error? {
        string userId = check getUserSub(ctx);
        return check userClient->delete("api/users/follow", {follower: friendId, following: userId});
    }

}

@http:ServiceConfig {
    auth: auth_config
}
service /central/api/subjects on central {

    resource function put .(http:RequestContext ctx, dto:ID subject) returns error? {
        string userId = check getUserSub(ctx);
        _ = check userClient->put("api/users/" + userId + "/subjects/", {subject: subject}, targetType = anydata);
    }

    resource function put goals(http:RequestContext ctx, dto:GoalAdjust goalAdjust) returns error? {
        string userId = check getUserSub(ctx);
        if goalAdjust.goalHours < <decimal>0 {
            return error("Goal hours cannot be negative");
        }
        http:Response res = check userClient->put("api/users/" + userId + "/subjects" + "/goals", {subject: {goalHours: goalAdjust.goalHours, id: goalAdjust.subjectId}});
        if (res.statusCode != 200) {
            return error("Failed to update goal hours");
        }
        return check studyClient->put("api/adjust-weekly-goal", {studentId: userId, subjectId: goalAdjust.subjectId, goalHours: goalAdjust.goalHours});
    }

    resource function delete .(http:RequestContext ctx, dto:ID subject) returns error? {
        string userId = check getUserSub(ctx);
        _ = check userClient->delete("api/users/" + userId + "/subjects", {subject: subject}, targetType = anydata);
    }

    resource function get [string subjectId](http:RequestContext ctx) returns response:StudyStatus|error? {
        string userId = check getUserSub(ctx);
        return check getStudyDetails(userId, subjectId);
    }

    resource function get [string subjectId]/[int year]/[int weekNo](http:RequestContext ctx) returns response:StudyStatus|error? {
        string userId = check getUserSub(ctx);
        return check getStudyDetails(userId, subjectId, year, weekNo);
    }

}

@http:ServiceConfig {
    auth: auth_config
}
service /central/api/study on central {

    resource function post .(http:RequestContext ctx, dto:StudySession studySession) returns error? {
        string userId = check getUserSub(ctx);
        dto:User user = check getUser(userId);
        decimal[] goalHours = from var subject in user.subjectIds
            where subject.id == studySession.subjectId
            select subject.goalHours;

        return check studyClient->post("api/study-session/", {...studySession, studentId: userId, goalHours: goalHours[0]});
    }

}

function getUserSub(http:RequestContext ctx) returns string|error {
    [jwt:Header, jwt:Payload] jwtInfo = check ctx.getWithType(http:JWT_INFORMATION);
    return jwtInfo[1].sub.toString().substring(6);
}

function getUser(string userId) returns dto:User|error {
    dto:User user = check userClient->get("api/users/" + userId);
    return user;
}

function getUsers(dto:ID[] usersObject, UserDetailLevel detailLevel = NAME) returns response:UserDetails[]|error {
    if (usersObject.length() == 0) {
        return [];
    }

    string userIds = from var user in usersObject
        select user.id + ",";

    userIds = userIds.substring(0, userIds.length() - 1);
    dto:User[]|dto:User users = check userClient->get("api/users/" + userIds);
    map<dto:UserStudySummary>? userStudySummaries = ();
    if detailLevel == FULL {
        userStudySummaries = check studyClient->get("api/study-summary/" + userIds);
    }
    response:UserDetails[] userDtos = [];
    if users is dto:User {
        userDtos.push({id: users.id, email: users.email, name: users.name});
        return userDtos;
    }
    foreach var user in users {
        response:UserDetails userDto = {id: user.id, email: user.email, name: user.name};
        if detailLevel == FULL {
            string subjectIds = from var subject in user.subjectIds
                select subject.id + ",";
            response:SubjectGoal[] subjects = check subjectClient->get("api/subjects/" + subjectIds);
            if userStudySummaries is map<dto:UserStudySummary> {
                dto:UserStudySummary studentSummary = userStudySummaries.get(user.id);
                foreach var subject in subjects {
                    subject.actualHours = 0;
                    foreach var subjectSummary in studentSummary.subjects {
                        if (subject.id == subjectSummary.id) {
                            subject.actualHours = subjectSummary.actualHours;
                            break;
                        }
                    }
                    foreach var subjectGoal in user.subjectIds {
                        if (subject.id == subjectGoal.id) {
                            subject.goalHours = subjectGoal.goalHours;
                            break;
                        }
                    }
                }
            }
            userDto.subjects = subjects;
        }
        userDtos.push(userDto);
    }

    return userDtos;
}

function getStudyDetails(string userId, string subjectId, int? year = (), int? weekNo = ()) returns response:StudyStatus|error {
    dto:User user = check getUser(userId);
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
        return error("User is not enrolled in the subject");
    }

    dto:Subject subject = check subjectClient->get("api/subjects/" + subjectId);
    dto:StudyStatus studyStatus;

    if year !is () && weekNo !is () {
        studyStatus = check studyClient->get("api/study-status/" + userId + "/" + subjectId + "/" + year.toString() + "/" + weekNo.toString());
        goalHours = studyStatus.goalHours;
    } else {
        studyStatus = check studyClient->get("api/current-study-status/" + userId + "/" + subjectId);
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

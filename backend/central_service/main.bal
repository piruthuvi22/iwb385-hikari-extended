import central_service.dto;
// import ballerina/io;
import central_service.response;

import ballerina/http;
import ballerina/jwt;

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

@http:ServiceConfig {
    auth: [
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
    ]
}
service /central/api/users on central {
    resource function get .(http:RequestContext ctx) returns response:UserDetails|error? {
        string userId = check getUserSub(ctx);
        dto:User user = check getUser(userId);
        response:UserDetails userDto = {id: user.id};

        string subjectIds = from var subject in user.subjectIds
            select subject.id + ",";
        subjectIds = subjectIds.substring(0, subjectIds.length() - 1);
        userDto.subjects = check subjectClient->get("api/subjects/" + subjectIds);
        return userDto;
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

    resource function post follow(http:RequestContext ctx) {
    }

    resource function post unfollow(http:RequestContext ctx) {
    }

    resource function post accept\-request(http:RequestContext ctx) {
    }

    resource function post reject\-request(http:RequestContext ctx) {
    }

}

service /central/api/subjects on central {
    resource function get [string subjectId](http:RequestContext ctx) returns response:StudyStatus|error? {
        string userId = check getUserSub(ctx);
        return check getStudyDetails(userId, subjectId);
    }

    resource function get [string subjectId]/[int year]/[int weekNo](http:RequestContext ctx) returns response:StudyStatus|error? {
        string userId = check getUserSub(ctx);
        return check getStudyDetails(userId, subjectId, year, weekNo);
    }

}

service /central/api/study on central {

    resource function post .(http:RequestContext ctx) {
        // string userId = check getUserSub(ctx);
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
        userDtos.push({id: users.id});
        return userDtos;
    }
    foreach var user in users {
        response:UserDetails userDto = {id: user.id};
        if detailLevel == FULL {
            string subjectIds = from var subject in user.subjectIds
                select subject.id + ",";
            dto:Subject[] subjects = check subjectClient->get("api/subjects/" + subjectIds);
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
    foreach var subject in user.subjectIds {
        if (subject.id == subjectId) {
            goalHours = subject.goalHours;
            break;
        }
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

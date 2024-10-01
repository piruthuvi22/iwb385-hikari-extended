import ballerinax/mongodb;
import ballerina/http;
import ballerina/time;

import study_service.models;
import study_service.dto;
import ballerina/uuid;

configurable string DATABASE_NAME = ?;
configurable string CONNECTION_URL = ?;

mongodb:Client mongoDb = check new ({
    connection: CONNECTION_URL
});

service on new http:Listener(9091) {
    private final mongodb:Database db;

    function init() returns error? {
        self.db = check mongoDb->getDatabase(DATABASE_NAME);
    }

    resource function post study\-session(dto:StudySessionDto studySessionDto) returns error? {

        if studySessionDto.noMins < <decimal> 0 {
            return error("Study session duration cannot be negative");
        }

        if studySessionDto.goalHours < <decimal> 0 {
            return error("Goal hours cannot be negative");
        }
        
        mongodb:Collection weeks = check self.db->getCollection("weeks");

        time:Utc currentTime = time:utcNow();

        models:StudySession newStudySession = {
            lessonId: studySessionDto.lessonId,
            noMins: studySessionDto.noMins,
            date: time:utcToString(currentTime)
        };

        int weekNo = check getWeekNumber(time:utcToCivil(currentTime));
        int year = time:utcToCivil(currentTime).year;

        models:Week|mongodb:Error? week = check weeks->findOne({
                weekNo: weekNo, 
                year: year, 
                studentId: studySessionDto.studentId, 
                subjectId: studySessionDto.subjectId
            });

        if week is () {

            models:Week newWeek = {
                id: uuid:createType1AsString(),
                weekNo: weekNo, 
                year: year,
                subjectId: studySessionDto.subjectId,
                studentId: studySessionDto.studentId,
                goalHours: studySessionDto.goalHours,
                actualHours: newStudySession.noMins / 60,
                studySessions: [newStudySession]
            };

            check weeks->insertOne(newWeek);

        } else if week is models:Week {

            models:Week updatedWeek = week.clone();
            updatedWeek.actualHours += newStudySession.noMins / 60;
            updatedWeek.studySessions.push(newStudySession);

            mongodb:UpdateResult updateResult = check weeks->updateOne({id: week.id}, {set:updatedWeek});

            if updateResult.modifiedCount != 1 {
                return error("Failed to update the week");
            }
        }

    }

    resource function get current\-study\-status/[string studentId]/[string subjectId]() returns dto:StudyStatusDto|error? {

        mongodb:Collection weeks = check self.db->getCollection("weeks");

        time:Utc currentTime = time:utcNow();
        int weekNo = check getWeekNumber(time:utcToCivil(currentTime));
        int year = time:utcToCivil(currentTime).year;
        
        models:Week|mongodb:Error? week = check weeks->findOne({
                weekNo: weekNo, 
                year: year, 
                studentId: studentId, 
                subjectId: subjectId
            });
        
        map<string> lessonDates = {};
        int i = weekNo;

        while i > weekNo-10 {
            models:Week|mongodb:Error? iWeek = check weeks->findOne({
                weekNo: i, 
                year: year, 
                studentId: studentId, 
                subjectId: subjectId
            });
            if iWeek is models:Week {
                foreach var studySession in iWeek.studySessions {
                    if lessonDates[studySession.lessonId] is () {
                        lessonDates[studySession.lessonId] = studySession.date;
                    }
                }
            }
            i = i - 1;
        }

        if week is () {
            return {
                studentId: studentId,
                subjectId: subjectId,
                weekNo: weekNo,
                year: year,
                actualHours: 0,
                goalHours: (),
                lessonDates: lessonDates,
                studiedLessons: ()
            }; 
        } else if week is models:Week {
            string[] studiedLessons = getStudiedLessons(week);
            return {
                studentId: studentId,
                subjectId: subjectId,
                weekNo: weekNo,
                year: year,
                actualHours: week.actualHours,
                goalHours: week.goalHours,
                lessonDates: lessonDates,
                studiedLessons: studiedLessons 
            }; 
        }

        return error("Failed to get status");
    }

    resource function get study\-status/[string studentId]/[string subjectId]/[int year]/[int weekNo]() returns dto:StudyStatusDto|error? {

        if weekNo < 1 {
            return error("Invalid week number");
        }
        
        if year < 1000 {
            return error("Invalid year");
        }

        mongodb:Collection weeks = check self.db->getCollection("weeks");
        
        models:Week|mongodb:Error? week = check weeks->findOne({
                weekNo: weekNo, 
                year: year, 
                studentId: studentId, 
                subjectId: subjectId
            });

        if week is () {
            return {
                studentId: studentId,
                subjectId: subjectId,
                weekNo: weekNo,
                year: year,
                actualHours: 0,
                goalHours: (),
                lessonDates: (),
                studiedLessons: ()
            }; 
        } else if week is models:Week {
            string[] studiedLessons = getStudiedLessons(week);
            return {
                studentId: studentId,
                subjectId: subjectId,
                weekNo: weekNo,
                year: year,
                actualHours: week.actualHours,
                goalHours: week.goalHours,
                lessonDates: (),
                studiedLessons: studiedLessons
            }; 
        }

        return error("Failed to get status");
    }

    resource function post adjust\-weekly\-goal(dto:GoalAdjustDto goalAdjust) returns error? {

        if goalAdjust.goalHours < <decimal> 0 {
            return error("Goal hours cannot be negative");
        }
        
        mongodb:Collection weeks = check self.db->getCollection("weeks");

        time:Utc currentTime = time:utcNow();

        int weekNo = check getWeekNumber(time:utcToCivil(currentTime));
        int year = time:utcToCivil(currentTime).year;

        models:Week|mongodb:Error? week = check weeks->findOne({
                weekNo: weekNo, 
                year: year, 
                studentId: goalAdjust.studentId, 
                subjectId: goalAdjust.subjectId
            });

        if week is () {

            models:Week newWeek = {
                id: uuid:createType1AsString(),
                weekNo: weekNo, 
                year: year,
                subjectId: goalAdjust.subjectId,
                studentId: goalAdjust.studentId,
                goalHours: goalAdjust.goalHours,
                actualHours: 0,
                studySessions: []
            };

            check weeks->insertOne(newWeek);

        } else if week is models:Week {

            if week.goalHours == goalAdjust.goalHours {
                return ();
            }

            models:Week updatedWeek = week.clone();
            
            updatedWeek.goalHours = goalAdjust.goalHours;

            mongodb:UpdateResult updateResult = check weeks->updateOne({id: week.id}, {set:updatedWeek});
            if updateResult.modifiedCount != 1 {
                return error("Failed to update the weekly goal");
            }
        }

    }

}

function getStudiedLessons(models:Week week) returns string[] {
    string[] studiedLessons = [];
    foreach var studySession in week.studySessions {
        if studiedLessons.indexOf(studySession.lessonId) == () {
            studiedLessons.push(studySession.lessonId);
        }
    }
    return studiedLessons;
}

function getWeekNumber(time:Civil date) returns int|error {
    
    time:Civil firstDayOfYear = {
        year: date.year,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        utcOffset: {hours: 5, minutes: 30}
    };

    decimal secondsElaped = time:utcDiffSeconds(check time:utcFromCivil(date), check time:utcFromCivil(firstDayOfYear));

    decimal SECONDS_IN_DAY = 86400;

    int daysElapsed = <int>(secondsElaped / SECONDS_IN_DAY);

    int weekNumber = (daysElapsed / 7) + 1;

    return weekNumber;
}
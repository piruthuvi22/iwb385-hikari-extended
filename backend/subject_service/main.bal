import subject_service.dto;
import subject_service.models;

import ballerina/http;
import ballerina/uuid;
import ballerinax/mongodb;

configurable string DATABASE_NAME = ?;
configurable string CONNECTION_URL = ?;

mongodb:Client mongoDb = check new ({
    connection: CONNECTION_URL
});

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"]
    }
}

service /api on new http:Listener(9092) {
    private final mongodb:Database db;

    @http:ResourceConfig {
        cors: {
            allowOrigins: ["*"]
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
        return getSubject(self.db, id);
    }

    resource function post subjects(dto:SubjectDto subjectDto) returns models:Subject|error? {
        mongodb:Collection subjects = check self.db->getCollection("subjects");
        models:Subject|error? existingSubject = check subjects->findOne({"name": subjectDto.name}); //unique subject name
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

    resource function put subjects/[string id](dto:SubjectDto subjectDto) returns models:Subject|error? {
        mongodb:Collection subjects = check self.db->getCollection("subjects");
        models:Subject|error? existingSubject = check subjects->findOne({id});
        if existingSubject !is models:Subject {
            return error(string `Subject with id ${id} not found`);
        }

        mongodb:UpdateResult updateResult = check subjects->updateOne({id}, {set: {name: subjectDto.name}});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to update the subject with id ${id}`);
        }
        return getSubject(self.db, id);
    }

    resource function post subjects/[string id]/lessons(dto:LessonDto lessonDto) returns models:Subject|error? {
        mongodb:Collection subjects = check self.db->getCollection("subjects");
        models:Subject|error? selectedSubject = check subjects->findOne({id});
        if selectedSubject !is models:Subject {
            return error(string `Subject with id ${id} not found`);
        }

        models:Lesson[] updateLesson = selectedSubject.lessons;
        foreach models:Lesson lesson in updateLesson {
            if lesson.name == lessonDto.name {
                return error(string `Lesson ${lessonDto.name} is already added`);
            }
        }

        updateLesson.push({id: uuid:createType1AsString(), name: lessonDto.name, no: lessonDto.no});
        mongodb:UpdateResult updateResult = check subjects->updateOne({id}, {set: {lessons: updateLesson}});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to update the subject with id ${id}`);
        }
        return getSubject(self.db, id);
    }

    resource function put lessons/[string id](dto:LessonDto lessonDto) returns models:Subject|error? {
        mongodb:Collection subjects = check self.db->getCollection("subjects");
        map<json> filter = {};
        filter["lessons.id"] = id;
        models:Subject|error? selectedSubject = check subjects->findOne(filter);
        if selectedSubject !is models:Subject {
            return error(string `Lesson with id ${id} not found`);
        }

        models:Lesson[] updateLesson = selectedSubject.lessons;
        foreach models:Lesson lesson in updateLesson {
            if lesson.id == id {
                lesson.name = lessonDto?.name;
                lesson.no = lessonDto?.no; //if lessonDto.no || lessonDto.name is null, it will not update the value
            }
        }
        mongodb:UpdateResult updateResult = check subjects->updateOne({id: selectedSubject.id}, {set: {lessons: updateLesson}});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to update the lesson with id ${id}`);
        }
        return getSubject(self.db, selectedSubject.id);
    }

    resource function get lessons/[string id]() returns models:Lesson|error? {
        mongodb:Collection subjects = check self.db->getCollection("subjects");
        map<json> filter = {};
        filter["lessons.id"] = id;
        models:Subject|error? selectedSubject = check subjects->findOne(filter);
        if selectedSubject !is models:Subject {
            return error(string `Subject wit id ${id} not found`);
        }

        models:Lesson[] selectedLesson = selectedSubject.lessons;
        foreach models:Lesson lesson in selectedLesson {
            if lesson.id == id {
                return lesson;
            }
        }
        return error(string `Lesson with id ${id} not found`);
    }

    resource function delete subjects/[string id]() returns string|error? {
        return deleteSubject(self.db, id);
    }

    resource function delete lessons/[string id]() returns string|error? {
        mongodb:Collection subjects = check self.db->getCollection("subjects");
        map<json> filter = {};
        filter["lessons.id"] = id;
        models:Subject|error? selectedSubject = check subjects->findOne(filter);
        if selectedSubject !is models:Subject {
            return error(string `Lesson with id ${id} not found`);
        }

        models:Lesson[] updateLesson = selectedSubject.lessons;
        foreach int i in 0 ... (updateLesson.length() - 1) {
            if (updateLesson[i].id == id) {
                models:Lesson _ = updateLesson.remove(i);
                break;
            }
        }

        mongodb:UpdateResult updateResult = check subjects->updateOne({id: selectedSubject.id}, {set: {lessons: updateLesson}});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to delete the lesson with id ${id}`);
        }
        return id;
    }
}

isolated function getSubject(mongodb:Database db, string id) returns models:Subject|error? {
    mongodb:Collection subjects = check db->getCollection("subjects");
    models:Subject|error? selectedSubject = check subjects->findOne({id});
    if selectedSubject !is models:Subject {
        return error(string `Failed to fetch subject with id ${id}`);
    }
    return selectedSubject;
}

isolated function deleteSubject(mongodb:Database db, string id) returns string|error? {
    mongodb:Collection subjects = check db->getCollection("subjects");
    models:Subject|error? selectedSubject = check subjects->findOne({id});
    if selectedSubject !is models:Subject {
        return error(string `Subject with id ${id} not found`);
    }

    mongodb:DeleteResult deleteResult = check subjects->deleteOne({id});
    if deleteResult.deletedCount != 1 {
        return error(string `Failed to delete the subject with id ${id}`);
    }
    return id;
}

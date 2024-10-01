import ballerina/http;

configurable string OAUTH2 = ?;



listener central = new http:Listener(9090);

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
service /api/user on central {
    resource function get .() returns string {
        return "HELLO";
    }

    resource function get friends() {}

    resource function post follow()  {}

    resource function post unfollow() {}

    resource function post accept\-request() {}

    resource function post reject\-request() {}

}

service /api/subject on central {
    resource function get . (string subjectId) {}

    resource function get friend (string userEmail, string subjectId) {}

    resource function post . (string subjectId) {}

    resource function delete . (string subjectId) {}

}

service /api/study on central {

    resource function get . () {}
    
    resource function get last20 () {}

    resource function post . () {}

}
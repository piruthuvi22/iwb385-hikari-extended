# Studify App

**Studify** is a study tracking app tailored for school students to help them set and achieve study goals effectively. It allows students to set weekly goals for each subject, log study hours, and track lesson completion. For example, a student studying ICT could aim for 3 hours of study per week. Each subject's progress is visually represented with a circular progress bar, offering a clear overview of how close they are to meeting their goals. Additionally, students can mark lessons as studied, making it easy to monitor their progress.

The app color-codes lesson statuses based on how recently they were studied:

- **Green**: Studied recently (within a week).
- **Yellow**: Last studied between a week ago and a month.
- **Red**: Last studied more than a month ago.

Students can also add friends from their classroom, and receive notifications when a friend achieves their weekly study goal for a subject.

## Functional Requirements

- User Registration.
- Allow students to set a weekly study goal in hours for each subject.
- Students can log study hours and specify the lessons studied.
- Visualize weekly goal completion for each subject.
- Lessons display the last studied date.
- Students can add friends from their classroom.

## Non-Functional Requirements

- Simple and intuitive user interface for easy study tracking.
- Sent notifications when a friend completes their weekly study goal.
- Compatible with both iOS and Android platforms.

## Architecture Diagram

The Studify App follows a **microservice architecture** where different functionalities are separated into individual services that communicate with each other. The key components of the system include:

- **Backend Microservices**:

  - **User Service**: Manages user registration, authentication, and friend connections.
  - **Subject Service**: Handles subject-related operations like setting study goals.
  - **Study Service**: Manages logging of study hours and tracking progress.
  - **Central Service**: Coordinates communication between services, acting as a mediator.

- **Frontend UI**: A React-based user interface that interacts with the backend microservices through REST APIs.

- **Database**: Each microservice connects to its own database instance, ensuring data separation and independence across services.

The architecture diagram below illustrates how these components interact:

![Architecture Diagram](https://firebasestorage.googleapis.com/v0/b/chat-c9b11.appspot.com/o/Architecture%20Diagram.png?alt=media&token=52d5161a-7779-4840-a7ec-e7ca20d0bedf)

## Instructions to Execute the Application

### Prerequisites

Ensure you have the following installed on your system:

- [Ballerina](https://ballerina.io/downloads/)
- [Node.js](https://nodejs.org/en/download/)

Follow these steps to execute the application:

### 1. Configure Each Service:

For each microservice (User Service, Subject Service, Study Service) and the Central Service, create `config.toml` file in their respective directories:

```toml
DATABASE_NAME = "<your-database-name>"
CONNECTION_URL = "<your-connection-url>"
```

Ensure the `DATABASE_NAME` and `CONNECTION_URL` values are correctly set for each service.

### 2. Configure the Frontend:

In the `frontend` directory, create a `.env` file with the following environment variables:

```bash
REACT_APP_AUTH0_DOMAIN="<your-auth0-domain>"
REACT_APP_AUTH0_CLIENT_ID="<your-auth0-client-id>"
```

Ensure these values are properly set for Auth0 authentication.

### 3. Run the Backend Services:

- For each microservice and the Central Service, open a terminal, navigate to the respective service directory, and run:

  ```bash
  bal run
  ```

### 4. Start the Frontend:

- Open a new terminal and navigate to the frontend directory:

  ```bash
  cd ./frontend
  ```

- Install the necessary dependencies:
  ```bash
  npm i
  ```
- Run the frontend:
  ```bash
  npm run start
  ```

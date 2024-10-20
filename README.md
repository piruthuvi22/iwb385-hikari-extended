# Studify App

This app is designed for school students to track their study activities, enabling them to set study goals for each subject, log the hours spent, mark completed lessons, and monitor their progress toward weekly targets. For example, a student studying ICT might set a goal of 3 hours per week. Each subject page features a circular progress bar to visually represent how much of the goal has been completed. Additionally, students can mark lessons they've studied.

The app color-codes lesson statuses based on how recently they were studied:

- Green: Studied recently (within a week).
- Yellow: Last studied between a week ago and a month.
- Red: Last studied more than a month ago.

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

![Architecture Diagram](https://firebasestorage.googleapis.com/v0/b/chat-c9b11.appspot.com/o/Architecture%20Diagram.png?alt=media&token=f66f4172-9e68-47b1-9653-50e0c68f4153)

## Instructions to Execute the Application

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

# File Management & Intake System

This is a full-stack web application that lets users upload, manage, edit, and process files.

## Project Documentation & Demos

* **Full Documentation:** [https://deepwiki.com/JhormanSantos/veleiroTest](https://deepwiki.com/JhormanSantos/veleiroTest)
* **Demo Video (3-5 min):** `https://www.youtube.com/watch?v=IsAMqEouzhY`
* **AI Reflection Video (≤ 2 min):** `https://www.youtube.com/watch?v=irDLUw7uWwU`
* **AI Conversation Log:** `https://g.co/gemini/share/61751e420f04`

---

## 🚀 Running the Project with Docker

To run the entire application stack (Next.js app + MySQL database), you only need Docker and Docker Compose installed.

### 1. Clone the Repository

```bash
git clone [Your_Repository_URL]
cd [repository-folder-name]
```

### 2. Create Environment File

Create a `.env` file in the root of the project by copying the example and filling in your credentials.

```env
# .env

# MySQL Database
MYSQL_DATABASE=file_intake_system
MYSQL_USER=user
MYSQL_PASSWORD=password
MYSQL_ROOT_PASSWORD=rootpassword

# Pulse API Key
PULSE_API_KEY="Your_Pulse_API_Key"
```

### 3. Run the Application

Execute the following command from the project root. This will build the application's Docker image and start both the app and database containers.

```bash
docker-compose up --build
```

### 4. Access the App

Once the containers are up and running, you can access the application in your browser at:

**[http://localhost:3000](http://localhost:3000)**
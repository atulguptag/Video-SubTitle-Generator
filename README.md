# AI-Powered Subtitle Generator

A web application that automatically generates and customizes subtitles for videos using AI technology.

## Features

- **AI-Powered Transcription**: Automatically generate subtitles from video content
- **Customizable Styles**: Choose from various subtitle styles and customize fonts, colors, and effects
- **Multilingual Support**: Support for English and Hindi subtitles
- **User Management**: Registration, login, password recovery via email verification
- **Social Authentication**: Google and Facebook login options
- **Export Options**: Download subtitles in various formats

## Tech Stack

### Frontend

- React with TypeScript
- Material-UI for UI components
- React Router for navigation
- Axios for API requests

### Backend

- Django REST Framework
- PostgreSQL database
- JWT authentication
- Social authentication with OAuth

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.8+
- PostgreSQL (optional, SQLite is used by default)
- **RabbitMQ** (for Celery task queue)

### Installation

1. **Clone the repository**:

   ```
   git clone https://github.com/atulguptag/Video-SubTitle-Generator.git
   cd Video-SubTitle-Generator
   ```

2. **Set up the backend**:

   ```
   cd backend
   python -m venv venv
   .\venv\Scripts\activate      # On Windows
   source venv/bin/activate     # On macOS/Linux
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py createsuperuser  # Follow prompts to create an admin user
   ```

3. **Set up RabbitMQ (required for Celery task queue)**:

   #### For Windows:

   - Download and install Erlang from [Erlang's official site](https://www.erlang.org/downloads).
   - Download and install RabbitMQ from [RabbitMQ's official site](https://www.rabbitmq.com/install-windows.html).
   - Enable the RabbitMQ management plugin:
     ```
     rabbitmq-plugins enable rabbitmq_management
     ```
   - Start the RabbitMQ service:
     ```
     rabbitmq-service start
     ```

   #### For macOS:

   - Install Homebrew if not already installed:
     ```
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     ```
   - Install RabbitMQ using Homebrew:
     ```
     brew install rabbitmq
     ```
   - Start RabbitMQ:
     ```
     brew services start rabbitmq
     ```

   #### For Linux (Ubuntu/Debian):

   - Update the package list:
     ```
     sudo apt update
     ```
   - Install Erlang and RabbitMQ:
     ```
     sudo apt install erlang
     sudo apt install rabbitmq-server
     ```
   - Enable and start the RabbitMQ service:
     ```
     sudo systemctl enable rabbitmq-server
     sudo systemctl start rabbitmq-server
     ```

4. **Set up the frontend**:

   ```
   cd ../frontend
   npm install
   ```

### Running the Application

You can run both the frontend and backend servers using the provided PowerShell script:

```
.\run.ps1
```

Or run them separately:

1. **Backend**:

   ```
   cd backend
   .\venv\Scripts\activate      # On Windows
   source venv/bin/activate     # On macOS/Linux
   python manage.py runserver
   ```

2. **Celery Worker (for task queue)**:

   ```
   cd backend
   celery -A subtitle_generator worker --loglevel=info --pool=solo
   ```

3. **Frontend**:

   ```
   cd frontend
   npm start
   ```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Admin interface: http://localhost:8000/admin

## Usage

1. Register a new account or log in with existing credentials
2. Upload a video from the dashboard
3. Once the video is processed, click "Edit Subtitles"
4. Generate subtitles in your preferred language
5. Customize the subtitle style, font, colors, etc.
6. Preview the video with the styled subtitles
7. Export the subtitles in your desired format

## Project Structure

```
Video-SubTitle-Generator/
├── backend/                  # Django backend
│   ├── authentication/       # User authentication app
│   ├── subtitle_generator/   # Main Django project
│   ├── subtitles/            # Subtitles app
│   ├── videos/               # Videos app
│   ├── manage.py             # Django management script
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React frontend
│   ├── public/               # Static files
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── context/          # Context providers
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   └── App.tsx           # Main App component
│   ├── package.json          # npm dependencies
│   └── tsconfig.json         # TypeScript configuration
├── run.ps1                   # Script to run both servers
└── README.md                 # Project documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was created based on the requirements specified in Project-Info.txt
- Special thanks to all the open-source libraries and frameworks used in this project

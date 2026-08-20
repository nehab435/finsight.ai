# FinSight.ai 🚀

### AI-Driven Financial Intelligence Platform

**FinSight.ai** is a full-stack, AI-powered financial management and document analysis platform designed to help users track financial accounts, analyze their financial health, and interact with an intelligent personal financial assistant.

## 🌐 Live Links

* **Live Demo:** [FinSight.ai on Vercel](https://finsight-ai-indol.vercel.app)
* **Backend API:** [Production Server Health Check](https://finsight-ai-zjfs.onrender.com/api/health)

---

## 🛠️ Tech Stack & Architecture

### Frontend (`/client`)

* **Framework:** React.js with Vite
* **Styling:** Modern, responsive UI components
* **State Management:** React Hooks
* **Routing:** React Router
* **API Integration:** Axios with automated JWT Bearer token interception

### Backend (`/server`)

* **Runtime & Framework:** Node.js and Express.js
* **Database & ODM:** MongoDB and Mongoose
* **Authentication:** JSON Web Tokens (JWT) and bcrypt password hashing
* **AI Integration:** LLM-powered financial insights and conversational assistance
* **Architecture:** Decoupled frontend and backend services deployed independently

---

## ✨ Key Features

### 🔐 Secure Authentication

* User registration and login
* Secure password hashing using bcrypt
* JWT-based authentication
* Protected routes and authenticated API access

### 📊 Financial Health Score & Insights

* Dynamic financial health score calculation
* Personalized financial insights
* Comprehensive financial wellbeing metrics

### 💳 Account & Document Management

* Financial account tracking
* Secure document upload and management
* Document parsing and financial data extraction

### 🤖 AI Financial Assistant

* Context-aware financial conversations
* AI-powered financial guidance
* Transaction and financial data analysis
* Personalized insights based on user context

### 🚀 Production-Ready Deployment

* Frontend deployed independently on Vercel
* Backend deployed as a production service on Render
* Environment-based configuration
* Decoupled full-stack architecture

---

## 🏗️ Project Structure

```text
finsight.ai/
│
├── client/                 # React + Vite frontend
│   ├── src/
│   ├── public/
│   └── .env
│
├── server/                 # Node.js + Express backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── .env
│
└── README.md
```

---

## ⚙️ Local Setup & Installation

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* MongoDB or a MongoDB Atlas connection

### 1. Clone the Repository

```bash
git clone https://github.com/nehab435/finsight.ai.git
cd finsight.ai
```

---

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend development server:

```bash
npm run dev
```

The backend will run at:

```text
http://localhost:5000
```

---

### 3. Set Up the Frontend

Open a new terminal and navigate to the frontend directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `client/` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

The application will typically be available at:

```text
http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Frontend

```env
VITE_API_URL=http://localhost:5000
```

> **Note:** Never commit your `.env` files or sensitive credentials to version control.

---

## 🚀 Deployment

The application follows a decoupled deployment architecture:

* **Frontend:** [Vercel]
* **Backend:** [Render]
* **Database:** MongoDB

This architecture allows the frontend and backend to scale and deploy independently.

---

## 👩‍💻 Author

**Neha Banala**

* GitHub: [@nehab435](https://github.com/nehab435)

---

⭐ If you found this project interesting, consider giving the repository a star!

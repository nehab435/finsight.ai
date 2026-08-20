#  FinSight.ai | AI-Driven Financial Intelligence Platform

FinSight.ai is a full-stack, AI-powered financial management and document analysis platform designed to help users track accounts, analyze financial health scores, and interact with an intelligent personal financial assistant. 

🌐 **Live Demo:** [Check out FinSight.ai on Vercel](https://finsight-ai-indol.vercel.app/)  
🔗 **Backend API:** [Render Production Server](https://finsight-ai-zjfs.onrender.com/api/health)

## 🛠️ Tech Stack & Architecture

### **Frontend (`/client`)**
* **Framework:** React.js (Vite)
* **Styling:** Modern UI components with responsive design
* **State Management & Routing:** React Hooks & React Router
* **API Integration:** Axios with automated JWT Bearer token interception

### **Backend (`/server`)**
* **Runtime & Framework:** Node.js, Express.js
* **Database & ODM:** MongoDB, Mongoose (v8+) with robust connection handling
* **Authentication:** JSON Web Tokens (JWT) & secure password hashing (bcrypt)
* **AI & External Services:** Integrated LLM capabilities for intelligent financial insights and chat interactions

## ✨ Key Features

* **🔐 Secure Authentication:** User registration, login, and JWT-secured route protection.
* **📊 Financial Health Score & Insights:** Dynamic calculation and display of comprehensive financial wellbeing metrics.
* **💳 Account & Document Management:** Seamless tracking of financial accounts and secure document parsing/upload workflows.
* **🤖 AI Financial Assistant:** Context-aware chat assistant providing real-time financial guidance and transaction analysis.
* **🚀 Production-Ready Infrastructure:** Deployed as a decoupled full-stack architecture with frontend on Vercel and backend microservice hosted on Render with automatic environment configuration.

---

## ⚙️ Local Setup & Installation

To run this project locally, follow these steps:

### 1. Clone the Repository
git clone [https://github.com/nehab435/finsight.ai.git](https://github.com/nehab435/finsight.ai.git)
cd finsight.ai

2. Setup Backend
   
cd server
npm install

Create a .env file inside the server/ directory:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Start the backend server:
Bash
npm run dev

3. Setup Frontend
   
Open a new terminal window:
cd client
npm install

Create a .env file inside the client/ directory:
VITE_API_URL=http://localhost:5000

Start the frontend development server:
npm run dev

👩‍💻 Author
Neha Banala

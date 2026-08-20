2. Setup Backend
Bash
cd server
npm install
Create a .env file inside the server/ directory:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
Start the backend server:

Bash
npm run dev
3. Setup Frontend
Open a new terminal window:

Bash
cd client
npm install
Create a .env file inside the client/ directory:

Code snippet
VITE_API_URL=http://localhost:5000
Start the frontend development server:

Bash
npm run dev
👩‍💻 Author
Neha Banala

LinkedIn

GitHub

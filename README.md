# 💰 SPLITIT - Expense Splitting App

A full-stack group expense splitting application built with React, Node.js, PostgreSQL, and Drizzle ORM. Split expenses with friends, track balances, and settle debts easily.

## 🚀 Features

- 👥 **Group Management** - Create and join expense groups
- 💵 **Expense Tracking** - Add expenses with multiple split strategies
- 📊 **Balance Calculation** - Real-time calculation of who owes whom
- 🔐 **Authentication** - Secure user authentication with JWT
- 💳 **Split Strategies** - Equal split, percentage-based, and exact amounts
- ✅ **Settlement Tracking** - Mark expenses as settled
- 🚫 **Leave Protection** - Users cannot leave groups with unsettled expenses

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Drizzle ORM** - Database ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing

### DevOps
- **Docker** - PostgreSQL containerization
- **Docker Compose** - Container orchestration

## 📋 Prerequisites

Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

### 2. Install dependencies
```bash
# Install root dependencies (optional)
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

Create a `.env` file in the **root directory**:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
# Database
DB_USER=expense_user
DB_PASSWORD=your_secure_password
DB_NAME=expense_tracker
DATABASE_URL=postgresql://expense_user:your_secure_password@localhost:5432/expense_tracker

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# Client
CLIENT_URL=http://localhost:3000

# React App
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start PostgreSQL Database
```bash
# From root directory
docker-compose up -d

# Verify it's running
docker ps
```

### 5. Run Database Migrations
```bash
cd server

# Generate migrations (first time only)
npm run db:generate

# Push schema to database
npm run db:push
```

### 6. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
# Client runs on http://localhost:3000
```

**Or run both together (from root):**
```bash
npm run dev
```

## 📁 Project Structure
```
expense-tracker/
├── client/                      # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                      # Node.js backend
│   ├── drizzle/
│   │   ├── schema.js           # Main schema (exports all models)
│   │   └── migrations/         # SQL migration files
│   ├── src/
│   │   ├── models/             # Database models
│   │   │   ├── user.model.js
│   │   │   ├── group.model.js
│   │   │   ├── expense.model.js
│   │   │   └── settlement.model.js
│   │   ├── routes/             # API routes
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Custom middleware
│   │   ├── utils/              # Helper functions
│   │   └── db.js               # Database connection
│   ├── server.js               # Entry point
│   ├── drizzle.config.js       # Drizzle configuration
│   └── package.json
├── docker-compose.yml           # Docker configuration
├── .env                         # Environment variables (not committed)
├── .env.example                 # Environment template
├── .gitignore
├── package.json                 # Root package.json (optional)
└── README.md
```

## 🗄️ Database Schema

### Users
- id, email, username, password, fullName, avatarUrl, createdAt

### Groups
- id, name, description, createdBy, createdAt

### Group Members
- id, groupId, userId, joinedAt

### Expenses
- id, groupId, paidBy, amount, description, splitStrategy, createdAt

### Expense Splits
- id, expenseId, userId, amountOwed, isSettled

### Settlements
- id, groupId, fromUser, toUser, amount, settledAt

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login user
GET    /api/auth/me          # Get current user
```

### Groups
```
POST   /api/groups           # Create a group
GET    /api/groups           # Get user's groups
GET    /api/groups/:id       # Get group details
POST   /api/groups/:id/join  # Join a group
DELETE /api/groups/:id/leave # Leave a group
```

### Expenses
```
POST   /api/expenses         # Add an expense
GET    /api/expenses/:groupId # Get group expenses
PUT    /api/expenses/:id     # Update expense
DELETE /api/expenses/:id     # Delete expense
```

### Settlements
```
POST   /api/settlements      # Record a settlement
GET    /api/settlements/:groupId # Get group settlements
```

## 🐳 Docker Commands
```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f postgres

# Restart database
docker-compose restart postgres

# Stop and delete all data (fresh start)
docker-compose down -v

# Access PostgreSQL CLI
docker exec -it expense_tracker_db psql -U expense_user -d expense_tracker
```

## 🔨 Development Commands

### Server
```bash
cd server

# Start development server
npm run dev

# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Client
```bash
cd client

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set build settings:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
4. Add environment variables:
   - `REACT_APP_API_URL=https://your-backend-url.com/api`

### Backend (Railway/Render)
1. Connect repository
2. Set root directory to `server`
3. Add environment variables (DATABASE_URL, JWT_SECRET, etc.)
4. Deploy!

### Database (Production)
- **Neon** - Serverless PostgreSQL (free tier)
- **Railway** - PostgreSQL with $5 free credit
- **Supabase** - PostgreSQL with generous free tier

## 🧪 Testing
```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_USER` | PostgreSQL username | `expense_user` |
| `DB_PASSWORD` | PostgreSQL password | `secure_password` |
| `DB_NAME` | Database name | `expense_tracker` |
| `DATABASE_URL` | Full connection string | `postgresql://user:pass@localhost:5432/db` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | Secret for JWT signing | `your_secret_min_32_chars` |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:3000` |
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@Itsroydip](https://github.com/Itsroydip)


## 🙏 Acknowledgments

- Inspired by Splitwise
- Built as a portfolio project to demonstrate full-stack development skills

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub.

---

⭐ If you found this project helpful, please give it a star!
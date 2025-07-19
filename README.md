# Crack-O-Date

A daily math puzzle web application where users create equations using the digits from today's date.

## 🎯 Game Concept

Players must create mathematical equations using all the digits from today's date in order. For example, with the date 7/18/2025, you must use the digits [7, 1, 8, 2, 0, 2, 5] to create a balanced equation like `7 + 1 = 8` or `(7 + 1) * 8 = 2 * (0 + 2) * 5`.

### Rules
- **Use all digits**: Every digit from today's date must be used exactly once
- **Maintain order**: Numbers must appear in the equation in the same sequence as the date
- **Balance required**: Left side must equal right side mathematically
- **Scoring**: Points based on operator complexity - basic (+, -) = 1pt, intermediate (×, ÷) = 2pts, advanced (^, √, |x|, mod) = 3pts

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 18** with TypeScript for type safety
- **React Router** for navigation between game, profile, and auth pages
- **KaTeX** integration for beautiful mathematical notation rendering
- **Custom CSS** with responsive design

### Backend (Express + TypeScript)
- **Express.js** API server with TypeScript
- **SQLite** database for persistent storage
- **JWT authentication** with bcrypt password hashing
- **Rate limiting** and CORS protection

### Key Components
- **Date Parser**: Converts dates into digit arrays with timezone handling
- **Math Parser**: Recursive descent parser that validates expressions and enforces game rules
- **Score Calculator**: Awards points based on operator complexity
- **Solution History**: Displays past solutions with proper mathematical formatting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crack-o-date
   ```

2. **Install all dependencies (recommended)**
   ```bash
   npm run install:all
   ```

   *Or install individually:*
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

### Development

**Start both client and server (recommended):**
```bash
npm run dev
```
- Server runs on http://localhost:3001
- Client runs on http://localhost:3000

**Or start individually:**
```bash
# Backend server
npm run dev:server

# Frontend client  
npm run dev:client
```

### Production Build

**Build everything:**
```bash
npm run build
```

**Or build individually:**
```bash
npm run build:client
npm run build:server
```

**Start production server:**
```bash
npm start
```

## 🎮 How to Play

1. **View Today's Numbers**: The current date digits are displayed at the top
2. **Create Your Equation**: Enter a mathematical expression using all the digits in order
3. **Submit**: The app validates your equation and calculates your score
4. **Track Progress**: View your solution history and statistics on the profile page

### Example Solutions
For date 7/18/2025 (digits: 7, 1, 8, 2, 0, 2, 5):
- Simple: `7 + 1 = 8` (uses first 3 digits)
- Complex: `7 * (1 + 8) = 2^(0 + 2) + 5` (uses all digits)

## 🗄️ Database Schema

- **users**: User accounts with authentication
- **puzzle_dates**: Date metadata and digit arrays  
- **solutions**: User equation submissions with scores
- **user_sessions**: JWT session management

## 📁 Project Structure

```
crack-o-date/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── utils/          # Date parsing and math validation
│   │   └── contexts/       # React context providers
│   └── public/             # Static assets
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Authentication middleware
│   │   └── database.ts     # Database schema and setup
│   └── database/           # SQLite database files
└── CLAUDE.md              # Development guidelines
```

## 🛠️ Development Tools

- **TypeScript**: Full type safety across frontend and backend
- **Jest**: Testing framework for business logic validation
- **ESLint**: Code quality and consistency
- **Rate Limiting**: API protection against abuse
- **CORS**: Cross-origin request handling

## 🔐 Security Features

- Bcrypt password hashing
- JWT session tokens with expiration
- SQL injection protection via parameterized queries
- Rate limiting on API endpoints
- CORS configuration for production deployment

## 📋 TODO List

### UI/UX Improvements
- [ ] Responsive layout for profile/logout buttons
- [ ] Visual equation builder with chips/bubbles instead of text input
- [ ] Drag-and-drop interface for numbers and operators

### Features
- [ ] Connect profile page to real user data
- [ ] Historical date puzzle solving
- [ ] User statistics and leaderboards
- [ ] Social sharing of solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
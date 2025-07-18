"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
function createAuthRoutes(db) {
    // Register new user
    router.post('/register', async (req, res) => {
        try {
            const { username, email, password } = req.body;
            // Validate input
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Username, email, and password are required' });
            }
            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters' });
            }
            // Check if user already exists
            const existingUser = await db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
            if (existingUser) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
            // Hash password
            const saltRounds = 10;
            const passwordHash = await bcrypt_1.default.hash(password, saltRounds);
            // Create user
            const result = await db.run('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, passwordHash]);
            // Generate token
            const token = (0, auth_1.generateToken)(result.lastID);
            res.status(201).json({
                message: 'User created successfully',
                token,
                user: {
                    id: result.lastID,
                    username,
                    email
                }
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // Login user
    router.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }
            // Find user
            const user = await db.get('SELECT id, username, email, password_hash FROM users WHERE email = ?', [email]);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            // Check password
            const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            // Generate token
            const token = (0, auth_1.generateToken)(user.id);
            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // Get current user
    router.get('/me', async (req, res) => {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: 'Access token required' });
            }
            // This would normally use the auth middleware, but for simplicity:
            const jwt = require('jsonwebtoken');
            const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const user = await db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [decoded.userId]);
                if (!user) {
                    return res.status(401).json({ error: 'Invalid token' });
                }
                res.json({ user });
            }
            catch (jwtError) {
                return res.status(401).json({ error: 'Invalid token' });
            }
        }
        catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    return router;
}
exports.createAuthRoutes = createAuthRoutes;
//# sourceMappingURL=auth.js.map
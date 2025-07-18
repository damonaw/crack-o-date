"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const database_1 = require("./database");
const auth_1 = require("./routes/auth");
const solutions_1 = require("./routes/solutions");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize database and routes
async function startServer() {
    try {
        const db = await (0, database_1.initializeDatabase)();
        console.log('Database initialized successfully');
        // Routes
        app.get('/api/health', (req, res) => {
            res.json({ status: 'OK', timestamp: new Date().toISOString() });
        });
        app.use('/api/auth', (0, auth_1.createAuthRoutes)(db));
        app.use('/api/solutions', (0, solutions_1.createSolutionsRoutes)(db));
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map
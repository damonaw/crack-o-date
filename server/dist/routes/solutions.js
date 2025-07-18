"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSolutionsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
function createSolutionsRoutes(db) {
    // Get or create puzzle date
    async function getOrCreatePuzzleDate(dateString, dateNumbers, monthLength, dayLength) {
        let puzzleDate = await db.get('SELECT * FROM puzzle_dates WHERE date_string = ?', [dateString]);
        if (!puzzleDate) {
            const result = await db.run('INSERT INTO puzzle_dates (date_string, date_numbers, month_length, day_length) VALUES (?, ?, ?, ?)', [dateString, JSON.stringify(dateNumbers), monthLength, dayLength]);
            puzzleDate = await db.get('SELECT * FROM puzzle_dates WHERE id = ?', [result.lastID]);
        }
        return puzzleDate;
    }
    // Submit a solution
    router.post('/', (0, auth_1.authenticateToken)(db), async (req, res) => {
        try {
            const { equation, score, leftValue, rightValue, dateString, dateNumbers, monthLength, dayLength, isRetroactive } = req.body;
            const userId = req.user.id;
            // Validate input
            if (!equation || !dateString || !dateNumbers || score === undefined || leftValue === undefined || rightValue === undefined) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            // Get or create puzzle date
            const puzzleDate = await getOrCreatePuzzleDate(dateString, dateNumbers, monthLength, dayLength);
            // Check if user already has a solution for this date
            const existingSolution = await db.get('SELECT id FROM solutions WHERE user_id = ? AND puzzle_date_id = ?', [userId, puzzleDate.id]);
            if (existingSolution) {
                return res.status(400).json({ error: 'Solution already exists for this date' });
            }
            // Create solution
            const result = await db.run('INSERT INTO solutions (user_id, puzzle_date_id, equation, score, left_value, right_value, is_retroactive) VALUES (?, ?, ?, ?, ?, ?, ?)', [userId, puzzleDate.id, equation, score, leftValue, rightValue, isRetroactive || false]);
            const solution = await db.get('SELECT * FROM solutions WHERE id = ?', [result.lastID]);
            res.status(201).json({
                message: 'Solution saved successfully',
                solution: {
                    ...solution,
                    date_string: puzzleDate.date_string,
                    date_numbers: JSON.parse(puzzleDate.date_numbers)
                }
            });
        }
        catch (error) {
            console.error('Submit solution error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // Get user's solutions
    router.get('/', (0, auth_1.authenticateToken)(db), async (req, res) => {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const solutions = await db.all(`SELECT s.*, pd.date_string, pd.date_numbers 
         FROM solutions s 
         JOIN puzzle_dates pd ON s.puzzle_date_id = pd.id 
         WHERE s.user_id = ? 
         ORDER BY s.created_at DESC 
         LIMIT ? OFFSET ?`, [userId, limit, offset]);
            const totalCount = await db.get('SELECT COUNT(*) as count FROM solutions WHERE user_id = ?', [userId]);
            res.json({
                solutions: solutions.map(sol => ({
                    ...sol,
                    date_numbers: JSON.parse(sol.date_numbers)
                })),
                pagination: {
                    page,
                    limit,
                    total: totalCount.count,
                    pages: Math.ceil(totalCount.count / limit)
                }
            });
        }
        catch (error) {
            console.error('Get solutions error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // Get user statistics
    router.get('/stats', (0, auth_1.authenticateToken)(db), async (req, res) => {
        try {
            const userId = req.user.id;
            const stats = await db.get(`SELECT 
          COUNT(*) as total_solutions,
          COUNT(CASE WHEN is_retroactive = 0 THEN 1 END) as current_solutions,
          SUM(score) as total_score,
          AVG(CASE WHEN is_retroactive = 0 THEN score END) as average_score,
          MAX(score) as highest_score
         FROM solutions 
         WHERE user_id = ?`, [userId]);
            res.json({
                stats: {
                    ...stats,
                    average_score: stats.average_score ? Math.round(stats.average_score * 10) / 10 : 0
                }
            });
        }
        catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    return router;
}
exports.createSolutionsRoutes = createSolutionsRoutes;
//# sourceMappingURL=solutions.js.map
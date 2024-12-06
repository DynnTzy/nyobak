const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { connectDB } = require('../mysql_db');
let connection;

const initDB = async () => {
  try {
    connection = await connectDB();
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

initDB();

/** 
 * @swagger 
 * /register: 
 *   post: 
 *     summary: Register a new user 
 *     tags: [User] 
 *     requestBody: 
 *       required: true 
 *       content: 
 *         application/json: 
 *           schema: 
 *             type: object 
 *             properties: 
 *               email: 
 *                 type: string 
 *               username: 
 *                 type: string 
 *               password: 
 *                 type: string 
 *     responses: 
 *       201: 
 *         description: User registered successfully 
 *       400: 
 *         description: User already exists 
 *       500: 
 *         description: Server error 
 */

router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;

    try {
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            return res.status(400).json({ statusCode: 400, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.execute('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, hashedPassword]);
        res.status(201).json({ statusCode: 201, message: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ statusCode: 500, message: 'Server error' });
    }
});

/** 
 * @swagger 
 * /login: 
 *   post: 
 *     summary: Login a user 
 *     tags: [User] 
 *     requestBody: 
 *       required: true 
 *       content: 
 *         application/json: 
 *           schema: 
 *             type: object 
 *             properties: 
 *               email: 
 *                 type: string 
 *               password: 
 *                 type: string 
 *     responses: 
 *       200: 
 *         description: Login successful 
 *       400: 
 *         description: Invalid credentials 
 *       500: 
 *         description: Server error 
 */

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(400).json({ statusCode: 400, message: 'Invalid credentials' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ statusCode: 400, message: 'Invalid credentials' });
        }

        res.status(200).json({ statusCode: 200, message: 'Login successful', loginResult: { userId: user.id, name: user.username, email: user.email } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ statusCode: 500, message: 'Server error' });
    }
});

/** 
 * @swagger 
 * /users: 
 *   get: 
 *     summary: Get all users 
 *     tags: [User] 
 *     responses: 
 *       200: 
 *         description: Successful response 
 *       500: 
 *         description: Server error 
 */

router.get('/users', async (req, res) => { 
    try { 
        const [users] = await connection.execute('SELECT * FROM users');
        res.status(200).json({ statusCode: 200, users });
    } catch (err) { 
        console.error(err.message); 
        res.status(500).json({ statusCode: 500, message: 'Server error' }); 
    } 
});

module.exports = router;    
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');

exports.register = async (req, res) => {
    const { studentId, password, fullName, email, phone, faculty } = req.body;

    // Basic validation
    if (!studentId || !password || !fullName || !email) {
        return res.status(400).json({ message: 'Please provide all required fields: studentId, password, fullName, email.' });
    }

    try {
        let user = await User.findByStudentId(studentId);
        if (user) {
            return res.status(400).json({ message: 'Student ID already exists' });
        }

        // faculty is likely a string name from frontend, e.g., "คณะวิศวกรรมศาสตร์" or an ID like "eng"
        // You need a robust way to map this to `faculty_id` (integer) if your `Users` table stores it as FK.
        // For simplicity here, we'll assume `faculty` is an ID that can be stored, or you handle the mapping.
        // Or, if your `APP_CONFIG.FACULTIES` on the frontend has `id` like "eng", "sci",
        // and your `Users` table's `faculty_id` can store this string or is nullable.
        // Let's assume faculty from frontend is an ID string or null.
        // For the User model, it expects `facultyId`.
        const facultyIdToUse = faculty; // Or logic to map faculty name/key to an integer ID if needed

        user = await User.create({
            studentId,
            password,
            fullName,
            email,
            phone,
            facultyId: facultyIdToUse
        });

        // Don't return password hash
        const userResponse = { ...user };
        delete userResponse.password_hash;

        res.status(201).json({ message: 'User registered successfully', user: userResponse });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during registration');
    }
};

exports.login = async (req, res) => {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
        return res.status(400).json({ message: 'Please provide student ID and password.' });
    }

    try {
        const user = await User.findByStudentId(studentId);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials (user not found)' });
        }

        const isMatch = await User.comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials (password incorrect)' });
        }

        const payload = {
            user: {
                id: user.user_id, // This is the PK from Users table
                studentId: user.student_id,
                fullName: user.full_name,
                // Add other relevant user info if needed, but keep payload small
            }
        };

        jwt.sign(
            payload,
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: { // Send some user info back, excluding sensitive data
                        id: user.user_id,
                        studentId: user.student_id,
                        fullName: user.full_name,
                        email: user.email,
                        facultyId: user.faculty_id
                    }
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during login');
    }
};

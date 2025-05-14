const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    async create(userData) {
        const { studentId, password, fullName, email, phone, facultyId } = userData;
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO Users (student_id, password_hash, full_name, email, phone_number, faculty_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id, student_id, full_name, email, faculty_id;
        `;
        // หมายเหตุ: faculty_id อาจเป็น null ถ้าไม่ได้ส่งมา หรือตารางคณะไม่ได้ใช้ id จริง
        // ในตัวอย่างนี้ จะใส่เป็น null หากไม่มี facultyId หรือ APP_CONFIG.FACULTIES ใน frontend เป็นแค่ array ตรงๆ
        // หากต้องการเชื่อมกับตาราง Faculties จริงๆ ต้องมีการ map ชื่อคณะกับ faculty_id ก่อน
        const facultyIdToInsert = facultyId ? parseInt(facultyId) : null; // หรือ logic การหา ID จากชื่อคณะ

        const values = [studentId, passwordHash, fullName, email, phone, facultyIdToInsert];
        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    async findByStudentId(studentId) {
        const query = `SELECT * FROM Users WHERE student_id = $1;`;
        try {
            const { rows } = await pool.query(query, [studentId]);
            return rows[0];
        } catch (error) {
            console.error('Error finding user by student ID:', error);
            throw error;
        }
    },

    async comparePassword(inputPassword, hashedPassword) {
        return await bcrypt.compare(inputPassword, hashedPassword);
    }
};

module.exports = User;

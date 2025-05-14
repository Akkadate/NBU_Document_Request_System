-- ตารางผู้ใช้งาน (Students)
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL, -- รหัสนักศึกษา (ใช้เป็น username)
    password_hash VARCHAR(255) NOT NULL,    -- รหัสผ่านที่ถูก hash แล้ว
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    faculty_id INT, -- Foreign key to Faculties table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- FOREIGN KEY (faculty_id) REFERENCES Faculties(faculty_id) -- ถ้ามีตารางคณะ
);

-- ตารางคณะ (ถ้าต้องการให้เป็น dynamic)
CREATE TABLE Faculties (
    faculty_id SERIAL PRIMARY KEY,
    faculty_name_th VARCHAR(100) NOT NULL,
    faculty_name_en VARCHAR(100),
    faculty_name_zh VARCHAR(100)
);

-- ตารางประเภทเอกสาร (ถ้าต้องการให้เป็น dynamic)
CREATE TABLE DocumentTypes (
    doc_type_id SERIAL PRIMARY KEY,
    type_name_key VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'doc_transcript' for translation
    base_price DECIMAL(10, 2) NOT NULL -- ราคาพื้นฐานต่อฉบับ
);

-- ตารางคำขอเอกสาร
CREATE TABLE DocumentRequests (
    request_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    doc_type_id INT NOT NULL,
    quantity INT NOT NULL,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivery_method VARCHAR(20) NOT NULL, -- 'self_pickup' or 'postal'
    pickup_option VARCHAR(20),           -- 'normal' or 'express' (if self_pickup)
    postal_address TEXT,                 -- (if postal)
    document_cost DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    total_cost DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(30) DEFAULT 'pending_payment', -- e.g., pending_payment, pending_verification, paid, rejected_payment
    document_status VARCHAR(30) DEFAULT 'pending', -- e.g., pending, processing, ready_for_pickup, shipped, completed, rejected
    payment_slip_path VARCHAR(255),      -- Path to the uploaded slip image/pdf
    admin_notes TEXT,                    -- หมายเหตุจากเจ้าหน้าที่
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (doc_type_id) REFERENCES DocumentTypes(doc_type_id)
);

-- อาจมีตารางสำหรับสถานะ Log หรือ Audit Trail เพิ่มเติม

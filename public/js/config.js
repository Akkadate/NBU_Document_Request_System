// นี่คือการจำลองการโหลดค่า config สำหรับ Frontend
// ในการใช้งานจริง ค่าเหล่านี้บางส่วนอาจถูกส่งมาจาก Backend หรือตั้งค่าตอน Build
const APP_CONFIG = {
    UNIVERSITY_NAME_TH: "มหาวิทยาลัยนอร์ทกรุงเทพ",
    UNIVERSITY_NAME_EN: "North Bangkok University",
    UNIVERSITY_NAME_ZH: "北曼谷大学",
    API_BASE_URL: "http://localhost:3000/api", // ตัวอย่าง URL ของ Backend API
    FACULTIES: [
        { id: "eng", name_th: "คณะวิศวกรรมศาสตร์", name_en: "Faculty of Engineering", name_zh: "工程学院" },
        { id: "sci", name_th: "คณะวิทยาศาสตร์", name_en: "Faculty of Science", name_zh: "理学院" },
        { id: "acc", name_th: "คณะบัญชี", name_en: "Faculty of Accountancy", name_zh: "会计学院" },
        // เพิ่มคณะอื่นๆ ตามต้องการ
    ],
    DOCUMENT_TYPES: [
        { id: "transcript", price: 100, name_key: "doc_transcript" },
        { id: "cert_student", price: 100, name_key: "doc_cert_student" },
        { id: "cert_expected_grad", price: 100, name_key: "doc_cert_expected_grad" },
        { id: "cert_graduated", price: 100, name_key: "doc_cert_graduated" },
        { id: "cert_course", price: 100, name_key: "doc_cert_course" },
        { id: "copy_degree", price: 100, name_key: "doc_copy_degree" },
        { id: "cert_conduct", price: 100, name_key: "doc_cert_conduct" },
        { id: "other", price: 100, name_key: "doc_other" } // ราคาอาจแตกต่างกันไปสำหรับ "อื่นๆ"
    ],
    DELIVERY_OPTIONS: {
        SELF_PICKUP_NORMAL_PRICE_PER_DOC: 100,
        SELF_PICKUP_EXPRESS_PRICE_PER_DOC: 150,
        POSTAL_PRICE_PER_DOC: 100,
        POSTAL_SHIPPING_FEE: 200
    },
    PAYMENT_INFO: {
        BANK_ACCOUNT: "123-4-56789-0 ธนาคารตัวอย่าง สาขานอร์ทกรุงเทพ",
        QR_CODE_IMAGE_URL: "assets/images/qr_code_placeholder.png"
    }
};

// ทำให้ APP_CONFIG พร้อมใช้งาน global (หรือ import/export ตามต้องการ)
window.APP_CONFIG = APP_CONFIG;

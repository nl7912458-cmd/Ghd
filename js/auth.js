// js/auth.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const loginBtn = document.getElementById('loginBtn');
const loginSpinner = document.getElementById('loginSpinner');

// Hàm xử lý đường dẫn thông minh (Fix lỗi 404 trên GitHub Pages)
function getRedirectUrl(page) {
    const currentPath = window.location.pathname;
    // Lấy thư mục hiện tại (ví dụ: /Ghd/) và nối với tên trang cần tới
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    return basePath + page;
}

// 1. Xử lý logic khi bấm nút Đăng nhập
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hiển thị trạng thái loading trên nút
        loginBtn.disabled = true;
        loginSpinner.classList.remove('hidden');
        errorMessage.classList.add('hidden');

        try {
            await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
            // Đăng nhập thành công, chuyển về trang chủ với đường dẫn chuẩn
            window.location.href = getRedirectUrl('index.html');
        } catch (error) {
            errorMessage.textContent = "Sai email hoặc mật khẩu. Vui lòng thử lại!";
            errorMessage.classList.remove('hidden');
        } finally {
            // Tắt trạng thái loading
            loginBtn.disabled = false;
            loginSpinner.classList.add('hidden');
        }
    });
}

// 2. Kiểm tra trạng thái đăng nhập trên toàn cục (Global Auth Guard)
// Lấy tên file hiện tại, xử lý cả trường hợp đuôi URL rỗng
const currentFileName = window.location.pathname.split('/').pop() || 'index.html';
const protectedPages = ['kienthuc.html', 'thucchien.html']; 

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Nếu đã đăng nhập mà lại đang ở trang login, đá về trang chủ
        if (currentFileName === 'login.html') {
            window.location.href = getRedirectUrl('index.html');
        }
        
        // Cập nhật giao diện Navbar nếu có nút Đăng nhập (chuyển thành Đăng xuất)
        const loginNavBtn = document.querySelector('nav a[href="login.html"]');
        if (loginNavBtn) {
            loginNavBtn.textContent = 'Đăng xuất';
            loginNavBtn.href = '#';
            loginNavBtn.addEventListener('click', (e) => {
                e.preventDefault();
                signOut(auth).then(() => {
                    window.location.href = getRedirectUrl('login.html');
                });
            });
        }
    } else {
        // Nếu chưa đăng nhập mà cố tình vào trang bảo vệ (Kiến thức, Thực chiến)
        if (protectedPages.includes(currentFileName)) {
            window.location.href = getRedirectUrl('login.html');
        }
    }
});

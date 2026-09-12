// js/auth.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const loginBtn = document.getElementById('loginBtn');
const loginSpinner = document.getElementById('loginSpinner');

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
            // Đăng nhập thành công, chuyển về trang chủ
            window.location.href = 'index.html';
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
// Lấy tên file hiện tại (ví dụ: login.html, kienthuc.html)
const currentPath = window.location.pathname.split('/').pop();
const protectedPages = ['kienthuc.html', 'thucchien.html']; 

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Nếu đã đăng nhập mà lại đang ở trang login, đá về trang chủ
        if (currentPath === 'login.html') {
            window.location.href = 'index.html';
        }
        
        // Cập nhật giao diện Navbar nếu có nút Đăng nhập (chuyển thành Đăng xuất)
        const loginNavBtn = document.querySelector('nav a[href="login.html"]');
        if (loginNavBtn) {
            loginNavBtn.textContent = 'Đăng xuất';
            loginNavBtn.href = '#';
            loginNavBtn.addEventListener('click', (e) => {
                e.preventDefault();
                signOut(auth).then(() => {
                    window.location.href = 'login.html';
                });
            });
        }
    } else {
        // Nếu chưa đăng nhập mà cố tình vào trang bảo vệ (Kiến thức, Thực chiến)
        if (protectedPages.includes(currentPath)) {
            window.location.href = 'login.html';
        }
    }
});

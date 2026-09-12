// js/auth.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const loginBtn = document.getElementById('loginBtn');
const loginSpinner = document.getElementById('loginSpinner');
const globalLoader = document.getElementById('globalLoader');

// Hàm lấy đúng đường dẫn tương đối dựa trên vị trí hiện tại của file HTML
function getRelativePath(targetPage) {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    // Nếu đang ở thư mục con (như /Ghd/), các file cùng cấp chỉ cần gọi tên file trực tiếp
    return targetPage;
}

// 1. Xử lý đăng nhập
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginBtn.disabled = true;
        if (loginSpinner) loginSpinner.classList.remove('hidden');
        if (errorMessage) errorMessage.classList.add('hidden');

        try {
            await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
            window.location.href = getRelativePath('index.html');
        } catch (error) {
            if (errorMessage) {
                errorMessage.textContent = "Sai email hoặc mật khẩu. Vui lòng thử lại!";
                errorMessage.classList.remove('hidden');
            }
        } finally {
            loginBtn.disabled = false;
            if (loginSpinner) loginSpinner.classList.add('hidden');
        }
    });
}

// 2. Kiểm tra trạng thái đăng nhập toàn cục và ẩn màn hình loading mờ
const currentFileName = window.location.pathname.split('/').pop() || 'index.html';
const protectedPages = ['kienthuc.html', 'thucchien.html']; 

onAuthStateChanged(auth, (user) => {
    const authActionBtn = document.getElementById('authActionBtn');

    if (user) {
        if (currentFileName === 'login.html') {
            window.location.href = getRelativePath('index.html');
            return;
        }
        
        // Đổi nút thành Đăng xuất
        if (authActionBtn) {
            authActionBtn.textContent = 'Đăng xuất';
            authActionBtn.href = '#';
            authActionBtn.onclick = (e) => {
                e.preventDefault();
                signOut(auth).then(() => {
                    window.location.href = getRelativePath('login.html');
                });
            };
        }
    } else {
        if (protectedPages.includes(currentFileName)) {
            window.location.href = getRelativePath('login.html');
            return;
        }
        
        if (authActionBtn) {
            authActionBtn.textContent = 'Đăng nhập';
            authActionBtn.href = getRelativePath('login.html');
        }
    }

    // Tắt màn hình loading mờ (tránh nháy giao diện)
    if (globalLoader) {
        globalLoader.classList.add('hidden');
    }
});

// js/auth.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const loginBtn = document.getElementById('loginBtn');
const loginSpinner = document.getElementById('loginSpinner');

// ĐẶT CỨNG TÊN THƯ MỤC CỦA BẠN TRÊN GITHUB Ở ĐÂY
const REPO_NAME = '/Ghd/'; 

function getRedirectUrl(page) {
    // Luôn luôn ghép chữ /Ghd/ vào trước tên trang
    return REPO_NAME + page;
}

// 1. Xử lý logic khi bấm nút Đăng nhập
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        loginBtn.disabled = true;
        loginSpinner.classList.remove('hidden');
        errorMessage.classList.add('hidden');

        try {
            await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
            // Đăng nhập thành công, CHẮC CHẮN chuyển về /Ghd/index.html
            window.location.href = getRedirectUrl('index.html');
        } catch (error) {
            errorMessage.textContent = "Sai email hoặc mật khẩu. Vui lòng thử lại!";
            errorMessage.classList.remove('hidden');
        } finally {
            loginBtn.disabled = false;
            loginSpinner.classList.add('hidden');
        }
    });
}

// 2. Kiểm tra trạng thái đăng nhập
const currentFileName = window.location.pathname.split('/').pop() || 'index.html';
const protectedPages = ['kienthuc.html', 'thucchien.html']; 

onAuthStateChanged(auth, (user) => {
    if (user) {
        if (currentFileName === 'login.html') {
            window.location.href = getRedirectUrl('index.html');
        }
        
        const loginNavBtn = document.querySelector('nav a[href="./login.html"]');
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
        if (protectedPages.includes(currentFileName)) {
            window.location.href = getRedirectUrl('login.html');
        }
    }
});

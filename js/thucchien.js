// js/thucchien.js
import { listDeThi } from '../data/list-data.js';

const examListView = document.getElementById('examListView');
const examDetailView = document.getElementById('examDetailView');
const examGrid = document.getElementById('examGrid');
const questionsContainer = document.getElementById('questionsContainer');
const quizForm = document.getElementById('quizForm');
const submitBtn = document.getElementById('submitBtn');
const resultBox = document.getElementById('resultBox');
const scoreDisplay = document.getElementById('scoreDisplay');
const backToListBtn = document.getElementById('backToListBtn');

// Các phần tử liên quan đến Timer
const mainNav = document.getElementById('mainNav');
const timerBar = document.getElementById('timerBar');
const timeDisplay = document.getElementById('timeDisplay');
const examTitleDisplay = document.getElementById('examTitle');
const timerIcon = document.querySelector('.timer-icon');

let currentExamData = [];
let timerInterval;
let timeLeft = 0; // Tính bằng giây

// 1. Render danh sách đề thi
function renderExamList() {
    examGrid.innerHTML = '';
    listDeThi.forEach(exam => {
        const card = document.createElement('div');
        card.className = 'apple-card bg-white p-6 rounded-3xl border border-gray-100 cursor-pointer flex flex-col justify-between hover:border-apple-blue/30';
        card.innerHTML = `
            <div>
                <h3 class="text-xl font-bold mb-2 text-apple-dark">${exam.title}</h3>
                <p class="text-gray-500 text-sm mb-4">Số câu: ${exam.questions} | Thời gian: ${exam.time} phút</p>
            </div>
            <button class="bg-gray-50 text-apple-blue font-medium py-2.5 rounded-xl hover:bg-blue-50 transition w-full">
                Bắt đầu làm bài
            </button>
        `;
        card.addEventListener('click', () => startExam(exam));
        examGrid.appendChild(card);
    });
}

// 2. Bắt đầu bài thi
async function startExam(examInfo) {
    try {
        const module = await import(\`../data/\${examInfo.id}.js\`);
        currentExamData = module.examData;
        
        // Chuyển đổi giao diện
        examListView.classList.add('hidden');
        examDetailView.classList.remove('hidden');
        resultBox.classList.add('hidden');
        quizForm.classList.remove('hidden');
        submitBtn.classList.remove('hidden');
        
        // Hiện thanh Timer, ẩn thanh Nav mặc định
        mainNav.classList.add('hidden');
        timerBar.classList.remove('hidden');
        examTitleDisplay.textContent = examInfo.title;
        
        // Render câu hỏi
        renderQuestions();
        
        // Bắt đầu đếm ngược (examInfo.time là phút)
        timeLeft = examInfo.time * 60; 
        updateTimerDisplay();
        clearInterval(timerInterval);
        timerInterval = setInterval(handleTimer, 1000);
        
        // Reset giao diện Timer về bình thường
        timerBar.classList.remove('bg-red-500', 'text-white');
        timerBar.classList.add('bg-white/90');
        timeDisplay.classList.remove('text-white');
        timerIcon.classList.remove('text-white');
        
    } catch (error) {
        alert("Đề thi này đang được cập nhật!");
    }
}

// 3. Render các câu hỏi ra form
function renderQuestions() {
    questionsContainer.innerHTML = '';
    currentExamData.forEach((q, index) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm question-block';
        qDiv.id = `q-block-${index}`;
        
        let optionsHTML = '';
        for (const [key, value] of Object.entries(q.options)) {
            optionsHTML += `
                <label class="flex items-start p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition option-label">
                    <input type="radio" name="question_${index}" value="${key}" class="mt-1 w-4 h-4 text-apple-blue focus:ring-apple-blue border-gray-300">
                    <span class="ml-3 text-gray-700 leading-relaxed"><strong class="font-medium mr-1">${key}.</strong> ${value}</span>
                </label>
            `;
        }

        qDiv.innerHTML = `
            <h4 class="text-lg font-semibold mb-4 text-apple-dark">Câu ${index + 1}: ${q.question}</h4>
            <div class="space-y-3">${optionsHTML}</div>
        `;
        questionsContainer.appendChild(qDiv);
    });
}

// 4. Xử lý đồng hồ đếm ngược
function handleTimer() {
    timeLeft--;
    updateTimerDisplay();
    
    // Đổi màu đỏ khi còn dưới 5 phút (300 giây)
    if (timeLeft === 300) {
        timerBar.classList.remove('bg-white/90');
        timerBar.classList.add('bg-red-500', 'text-white');
        timeDisplay.classList.add('text-white');
        timerIcon.classList.add('text-white');
    }
    
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        submitExam(); // Tự động nộp
    }
}

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timeDisplay.textContent = `${m}:${s}`;
}

// 5. Chấm điểm & Nộp bài
function submitExam() {
    clearInterval(timerInterval);
    
    // Ẩn thanh Timer, hiện lại Nav
    timerBar.classList.add('hidden');
    mainNav.classList.remove('hidden');
    submitBtn.classList.add('hidden'); // Ẩn nút nộp
    
    let score = 0;
    const total = currentExamData.length;
    const formData = new FormData(quizForm);

    currentExamData.forEach((q, index) => {
        const userAnswer = formData.get(`question_${index}`);
        const qBlock = document.getElementById(`q-block-${index}`);
        const inputs = qBlock.querySelectorAll('input[type="radio"]');
        
        // Vô hiệu hóa việc chọn lại
        inputs.forEach(input => input.disabled = true);

        if (userAnswer === q.correctAnswer) {
            score++;
            // Bôi xanh đáp án đúng mà user chọn
            if(userAnswer) {
                const checkedLabel = qBlock.querySelector(`input[value="${userAnswer}"]`).parentElement;
                checkedLabel.classList.add('bg-green-50', 'border-green-400');
            }
        } else {
            // Bôi đỏ đáp án user chọn sai
            if (userAnswer) {
                const checkedLabel = qBlock.querySelector(`input[value="${userAnswer}"]`).parentElement;
                checkedLabel.classList.add('bg-red-50', 'border-red-400');
            }
            // Khoanh xanh đáp án đúng để user biết
            const correctLabel = qBlock.querySelector(`input[value="${q.correctAnswer}"]`).parentElement;
            correctLabel.classList.add('bg-green-50', 'border-green-400', 'ring-1', 'ring-green-400');
        }
    });

    // Hiện điểm
    resultBox.classList.remove('hidden');
    scoreDisplay.textContent = `${score}/${total}`;
    
    // Tự động cuộn lên xem điểm
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Bắt sự kiện nộp bài tay
quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(confirm("Bạn có chắc chắn muốn nộp bài?")) {
        submitExam();
    }
});

// Nút quay lại danh sách
backToListBtn.addEventListener('click', () => {
    examDetailView.classList.add('hidden');
    examListView.classList.remove('hidden');
});

// Khởi chạy
renderExamList();


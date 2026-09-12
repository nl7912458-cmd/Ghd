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

const mainNav = document.getElementById('mainNav');
const timerBar = document.getElementById('timerBar');
const timeDisplay = document.getElementById('timeDisplay');
const examTitleDisplay = document.getElementById('examTitle');
const timerIcon = document.querySelector('.timer-icon');

let currentExamData = [];
let timerInterval;
let timeLeft = 0;

function renderExamList() {
    if (!examGrid) return;
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

async function startExam(examInfo) {
    try {
        // ĐÃ SỬA: Sửa lỗi cú pháp dynamic import
        const module = await import(`../data/${examInfo.id}.js`);
        currentExamData = module.examData;
        
        examListView.classList.add('hidden');
        examDetailView.classList.remove('hidden');
        resultBox.classList.add('hidden');
        if (quizForm) quizForm.reset();
        if (submitBtn) submitBtn.classList.remove('hidden');
        
        if (mainNav) mainNav.classList.add('hidden');
        if (timerBar) timerBar.classList.remove('hidden');
        if (examTitleDisplay) examTitleDisplay.textContent = examInfo.title;
        
        renderQuestions();
        
        timeLeft = examInfo.time * 60; 
        updateTimerDisplay();
        clearInterval(timerInterval);
        timerInterval = setInterval(handleTimer, 1000);
        
        if (timerBar) {
            timerBar.classList.remove('bg-red-500', 'text-white');
            timerBar.classList.add('bg-white/90');
        }
        if (timeDisplay) timeDisplay.classList.remove('text-white');
        if (timerIcon) timerIcon.classList.remove('text-white');
        
    } catch (error) {
        console.error(error);
        alert("Đề thi này đang được cập nhật!");
    }
}

function renderQuestions() {
    if (!questionsContainer) return;
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

function handleTimer() {
    timeLeft--;
    updateTimerDisplay();
    
    if (timeLeft === 300 && timerBar) {
        timerBar.classList.remove('bg-white/90');
        timerBar.classList.add('bg-red-500', 'text-white');
        if (timeDisplay) timeDisplay.classList.add('text-white');
        if (timerIcon) timerIcon.classList.add('text-white');
    }
    
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        submitExam();
    }
}

function updateTimerDisplay() {
    if (!timeDisplay) return;
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timeDisplay.textContent = `${m}:${s}`;
}

function submitExam() {
    clearInterval(timerInterval);
    
    if (timerBar) timerBar.classList.add('hidden');
    if (mainNav) mainNav.classList.remove('hidden');
    if (submitBtn) submitBtn.classList.add('hidden');
    
    let score = 0;
    const total = currentExamData.length;
    const formData = new FormData(quizForm);

    currentExamData.forEach((q, index) => {
        const userAnswer = formData.get(`question_${index}`);
        const qBlock = document.getElementById(`q-block-${index}`);
        if (!qBlock) return;
        
        const inputs = qBlock.querySelectorAll('input[type="radio"]');
        inputs.forEach(input => input.disabled = true);

        if (userAnswer === q.correctAnswer) {
            score++;
            if(userAnswer) {
                const checkedLabel = qBlock.querySelector(`input[value="${userAnswer}"]`).parentElement;
                if (checkedLabel) checkedLabel.classList.add('bg-green-50', 'border-green-400');
            }
        } else {
            if (userAnswer) {
                const checkedLabel = qBlock.querySelector(`input[value="${userAnswer}"]`).parentElement;
                if (checkedLabel) checkedLabel.classList.add('bg-red-50', 'border-red-400');
            }
            const correctLabel = qBlock.querySelector(`input[value="${q.correctAnswer}"]`).parentElement;
            if (correctLabel) correctLabel.classList.add('bg-green-50', 'border-green-400', 'ring-1', 'ring-green-400');
        }
    });

    if (resultBox) resultBox.classList.remove('hidden');
    if (scoreDisplay) scoreDisplay.textContent = `${score}/${total}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

if (quizForm) {
    quizForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if(confirm("Bạn có chắc chắn muốn nộp bài?")) {
            submitExam();
        }
    });
}

if (backToListBtn) {
    backToListBtn.addEventListener('click', () => {
        examDetailView.classList.add('hidden');
        examListView.classList.remove('hidden');
    });
}

renderExamList();

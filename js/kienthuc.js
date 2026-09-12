// js/kienthuc.js
import { listTaiLieu } from '../data/list-data.js';

const listView = document.getElementById('listView');
const detailView = document.getElementById('detailView');
const documentGrid = document.getElementById('documentGrid');
const backBtn = document.getElementById('backBtn');
const pdfContent = document.getElementById('pdfContent');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

let currentDocTitle = 'TaiLieu';

function renderList() {
    if (!documentGrid) return;
    documentGrid.innerHTML = '';
    listTaiLieu.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'apple-card bg-white p-6 rounded-2xl border border-gray-100 cursor-pointer flex flex-col h-full';
        card.innerHTML = `
            <div class="text-xs font-semibold text-apple-blue mb-2">${doc.date}</div>
            <h3 class="text-xl font-bold mb-3 text-apple-dark">${doc.title}</h3>
            <p class="text-gray-500 text-sm flex-grow">${doc.description}</p>
        `;
        card.addEventListener('click', () => loadDocument(doc.id, doc.title));
        documentGrid.appendChild(card);
    });
}

async function loadDocument(id, title) {
    try {
        // ĐÃ SỬA: Sửa lỗi cú pháp string interpolation trong dynamic import
        const module = await import(`../data/${id}.js`);
        pdfContent.innerHTML = module.content;
        currentDocTitle = title;
        
        listView.classList.add('hidden');
        detailView.classList.remove('hidden');
    } catch (error) {
        console.error(error);
        alert("Nội dung bài học này đang được cập nhật!");
    }
}

if (backBtn) {
    backBtn.addEventListener('click', () => {
        detailView.classList.add('hidden');
        listView.classList.remove('hidden');
        pdfContent.innerHTML = '';
    });
}

if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
        downloadPdfBtn.classList.add('hidden'); 
        const element = document.getElementById('pdfContent');
        const opt = {
            margin:       15,
            filename:     `${currentDocTitle}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            downloadPdfBtn.classList.remove('hidden');
        });
    });
}

renderList();

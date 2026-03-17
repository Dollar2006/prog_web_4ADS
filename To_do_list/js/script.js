// 1. ESTADO DA APLICAÇÃO
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentCategoryFilter = 'todas';

// Referências do DOM
const form = document.getElementById('task-form');
const taskListEl = document.getElementById('task-list');
const categoryCards = document.querySelectorAll('.category-card');
const sortTasks = document.getElementById('sort-tasks');

// Modal Elements
const modalOverlay = document.getElementById('task-modal');
const addTaskBtn = document.getElementById('add-task-btn');
const closeModalBtn = document.getElementById('close-modal');

// Theme Management
let currentTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);

// Temos dois botões agora (um no mobile, um na sidebar do desktop)
const themeToggleBtns = document.querySelectorAll('#theme-toggle, #theme-toggle-desktop');

function updateThemeIcon() {
    themeToggleBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) {
            if (currentTheme === 'dark') {
                icon.className = 'fa-solid fa-moon';
            } else {
                icon.className = 'fa-solid fa-sun';
            }
        }
    });
}
updateThemeIcon();

themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        updateThemeIcon();
    });
});

// Modal Toggle
addTaskBtn.addEventListener('click', () => {
    modalOverlay.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', (e) => {
    if(e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});


// Atualizar Contadores
function updateCounters() {
    const counts = {
        'todas': tasks.length,
        'Trabalho': tasks.filter(t => t.category === 'Trabalho').length,
        'Estudos': tasks.filter(t => t.category === 'Estudos').length,
        'Pessoal': tasks.filter(t => t.category === 'Pessoal').length
    };

    document.getElementById('count-todas').innerText = `${counts['todas']} tasks`;
    document.getElementById('count-trabalho').innerText = `${counts['Trabalho']} tasks`;
    document.getElementById('count-estudos').innerText = `${counts['Estudos']} tasks`;
    document.getElementById('count-pessoal').innerText = `${counts['Pessoal']} tasks`;
}


// 2. FUNÇÃO PRINCIPAL: Renderizar a tela
function renderTasks() {
    taskListEl.innerHTML = '';
    
    let filteredTasks = [...tasks];

    // Aplicar Filtro de Categoria
    if (currentCategoryFilter !== 'todas') {
        filteredTasks = filteredTasks.filter(t => t.category === currentCategoryFilter);
    }

    // Aplicar Ordenação
    const sortValue = sortTasks.value;
    if (sortValue === 'date') {
        filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortValue === 'priority') {
        const priorityWeight = { 'alta': 1, 'media': 2, 'baixa': 3 };
        filteredTasks.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
    }

    // Gerar os cards no HTML
    filteredTasks.forEach(task => {
        const card = document.createElement('div');
        
        // Formata a data
        const formattedDate = new Date(task.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
        
        // Define o icone/cor da prioridade
        let priClass = '';
        let cardColorClass = '';
        if(task.priority === 'alta') { priClass = 'pri-alta'; cardColorClass = 'card-alta'; }
        if(task.priority === 'media') { priClass = 'pri-media'; cardColorClass = 'card-media'; }
        if(task.priority === 'baixa') { priClass = 'pri-baixa'; cardColorClass = 'card-baixa'; }

        card.className = `task-card glass-effect ${cardColorClass} ${task.completed ? 'completed' : ''}`;

        card.innerHTML = `
            <div class="task-check" onclick="toggleStatus(${task.id})">
                <i class="fa-solid fa-check"></i>
            </div>
            <div class="task-content">
                <div class="task-title">${task.name}</div>
                <div class="task-meta">
                    <span><span class="priority-indicator ${priClass}"></span>${task.category}</span>
                    <span><i class="fa-regular fa-calendar" style="margin-right:4px"></i>${formattedDate}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="delete-btn" onclick="deleteTask(${task.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        taskListEl.appendChild(card);
    });

    updateCounters();
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Category Filtering logic
categoryCards.forEach(card => {
    card.addEventListener('click', () => {
        // Remover active de todos
        categoryCards.forEach(c => c.classList.remove('active'));
        // Adicionar active no clicado
        card.classList.add('active');
        
        currentCategoryFilter = card.getAttribute('data-value');
        renderTasks();
    });
});

// 3. ADICIONAR TAREFA
form.addEventListener('submit', function(e) {
    e.preventDefault();

    const newTask = {
        id: Date.now(),
        name: document.getElementById('task-name').value,
        category: document.getElementById('task-category').value,
        priority: document.getElementById('task-priority').value,
        date: document.getElementById('task-date').value,
        completed: false
    };

    tasks.push(newTask);
    form.reset();
    modalOverlay.classList.remove('active'); // close modal
    renderTasks();
});

// 4. DELETAR TAREFA
window.deleteTask = function(id) {
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
}

// 5. MARCAR COMO CONCLUÍDA
window.toggleStatus = function(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    renderTasks();
}

// 6. EVENTOS DE ORDENAÇÃO
sortTasks.addEventListener('change', renderTasks);

// Inicializa
renderTasks();
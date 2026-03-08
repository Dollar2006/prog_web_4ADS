// 1. ESTADO DA APLICAÇÃO (A Fonte da Verdade)
// Tenta carregar do localStorage, se não tiver, inicia vazio
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Referências do DOM
const form = document.getElementById('task-form');
const taskListEl = document.getElementById('task-list');
const filterCategory = document.getElementById('filter-category');
const sortTasks = document.getElementById('sort-tasks');

// 2. FUNÇÃO PRINCIPAL: Renderizar a tela
// Toda vez que o estado (dados) muda, chamamos essa função. Ela limpa e desenha de novo.
function renderTasks() {
    taskListEl.innerHTML = ''; // Limpa a tela
    
    let filteredTasks = [...tasks]; // Cria uma cópia para não alterar o array original na filtragem

    // Aplicar Filtro [cite: 36]
    const categoryValue = filterCategory.value;
    if (categoryValue !== 'todas') {
        filteredTasks = filteredTasks.filter(t => t.category === categoryValue);
    }

    // Aplicar Ordenação [cite: 37]
    const sortValue = sortTasks.value;
    if (sortValue === 'date') {
        filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortValue === 'priority') {
        const priorityWeight = { 'alta': 1, 'media': 2, 'baixa': 3 }; // Mapeamento de peso para ordenar
        filteredTasks.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
    }

    // Gerar os cards no HTML [cite: 28]
    filteredTasks.forEach(task => {
        const card = document.createElement('div');
        // Adiciona classes baseadas na prioridade e status [cite: 31, 33]
        card.className = `task-card priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        
        // Formata a data para o padrão brasileiro [cite: 31]
        const formattedDate = new Date(task.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'});

        card.innerHTML = `
            <h3>${task.name}</h3>
            <p><strong>Categoria:</strong> ${task.category}</p> <p><strong>Prioridade:</strong> ${task.priority.toUpperCase()}</p> <p><strong>Data Limite:</strong> ${formattedDate}</p> <div class="card-actions">
                <button onclick="toggleStatus(${task.id})">${task.completed ? 'Desfazer' : 'Concluir'}</button> <button onclick="deleteTask(${task.id})" style="background-color: #dc3545;">Excluir</button> </div>
        `;
        taskListEl.appendChild(card);
    });

    // Salvar no navegador sempre que renderizar
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 3. ADICIONAR TAREFA [cite: 24]
form.addEventListener('submit', function(e) {
    e.preventDefault(); // Evita recarregar a página

    const newTask = {
        id: Date.now(), // Gera um ID único baseado no tempo
        name: document.getElementById('task-name').value,
        category: document.getElementById('task-category').value,
        priority: document.getElementById('task-priority').value,
        date: document.getElementById('task-date').value,
        completed: false
    };

    tasks.push(newTask);
    form.reset(); // Limpa os campos
    renderTasks(); // Atualiza a tela
});

// 4. DELETAR TAREFA [cite: 33]
function deleteTask(id) {
    // Filtra o array, removendo a tarefa com o ID passado
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
}

// 5. MARCAR COMO CONCLUÍDA [cite: 33]
function toggleStatus(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed }; // Inverte o status
        }
        return task;
    });
    renderTasks();
}

// 6. EVENTOS DE FILTRO E ORDENAÇÃO 
filterCategory.addEventListener('change', renderTasks);
sortTasks.addEventListener('change', renderTasks);

// Inicializa a aplicação desenhando as tarefas salvas
renderTasks();
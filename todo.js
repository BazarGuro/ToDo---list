document.addEventListener('DOMContentLoaded', () => {
  const todoInput = document.getElementById('todoInput');
  const addTodoBtn = document.getElementById('addTodoBtn');
  const todoList = document.getElementById('todoList');
  const filterButtons = document.createElement('div');
  filterButtons.className = 'filter-buttons';
  
  ['Все', 'Активные', 'Завершённые'].forEach(text => {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'filter-btn';
    button.addEventListener('click', () => filterTodos(text.toLowerCase()));
    filterButtons.appendChild(button);
  });
  
  document.querySelector('.todo-container').insertBefore(filterButtons, todoList);

  // Загрузка задач из localStorage
  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  let saveTimeout;

  // Функция сохранения задач в localStorage с дебаунсингом
  const saveTodos = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      localStorage.setItem('todos', JSON.stringify(todos));
    }, 300);
  };

  // Функция валидации и очистки текста от XSS
  const sanitizeText = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Функция фильтрации задач
  const filterTodos = (filter) => {
    const items = todoList.getElementsByClassName('todo-item');
    Array.from(items).forEach(item => {
      switch(filter) {
        case 'активные':
          item.style.display = item.classList.contains('completed') ? 'none' : 'flex';
          break;
        case 'завершённые':
          item.style.display = item.classList.contains('completed') ? 'flex' : 'none';
          break;
        default:
          item.style.display = 'flex';
      }
    });
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.toLowerCase() === filter);
    });
  };

  // Функция создания элемента задачи
  const createTodoElement = (todo) => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = sanitizeText(todo.text);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Удалить';

    // Обработчик изменения статуса задачи
    checkbox.addEventListener('change', () => {
      todo.completed = checkbox.checked;
      li.classList.toggle('completed');
      saveTodos();
    });

    // Обработчик редактирования задачи
    text.addEventListener('dblclick', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'edit-input';
      input.value = todo.text;
      
      const finishEditing = () => {
        const newText = input.value.trim();
        if (newText && newText !== todo.text) {
          todo.text = sanitizeText(newText);
          text.textContent = todo.text;
          saveTodos();
        }
        li.replaceChild(text, input);
      };

      input.addEventListener('blur', finishEditing);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          finishEditing();
        }
      });

      li.replaceChild(input, text);
      input.focus();
    });

    // Обработчик удаления задачи
    deleteBtn.addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
        li.remove();
        todos = todos.filter(t => t !== todo);
        saveTodos();
      }
    });

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(deleteBtn);

    return li;
  };

  // Функция добавления новой задачи
  const addTodo = () => {
    const text = todoInput.value.trim();
    if (text) {
      const todo = { text, completed: false };
      todos.push(todo);
      todoList.appendChild(createTodoElement(todo));
      saveTodos();
      todoInput.value = '';
    }
  };

  // Обработчики событий
  addTodoBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  });

  // Отображение существующих задач
  todos.forEach(todo => {
    todoList.appendChild(createTodoElement(todo));
  });
});
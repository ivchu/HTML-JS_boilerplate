import './style.css';

class Sort {
  constructor(id, name, sortFunction) {
    this.id = id;
    this.name = name;
    this.sortFunction = sortFunction;
  }
}

class Task {
  constructor({
    name = '',
    done = false,
    id = Math.random(1000000).toString(),
    creationDate = new Date(),
    resolutionDate = null
  }
  ) {
    this.name = name;
    this.done = done;
    this.id = id;
    this.creationDate = new Date(creationDate);
    this.resolutionDate = resolutionDate ? new Date(resolutionDate) : null;
  }

  changeStatus() {
    if (this.done) {
      this.done = false;
      this.resolutionDate = null;
    } else {
      this.done = true;
      this.resolutionDate = new Date();
    }
  };

  changeTask(name) {
    this.name = name;
  };

}

let sortOpenOptions = [
  new Sort('openNameAsc', 'Text (asc)', (a, b) => a.name.localeCompare(b.name)),
  new Sort('openNameDesc', 'Text (desc)', (a, b) => b.name.localeCompare(a.name)),
  new Sort('openDateAsc', 'Creation date (asc)', (a, b) => a.creationDate - b.creationDate),
  new Sort('openDateDesc', 'Creation date (desc)', (a, b) => b.creationDate - a.creationDate)
];
let sortDoneOptions = [
  new Sort('doneNameAsc', 'Text (asc)', (a, b) => a.name.localeCompare(b.name)),
  new Sort('doneNameDesc', 'Text (desc)', (a, b) => b.name.localeCompare(a.name)),
  new Sort('doneDateAsc', 'Resolution date (asc)', (a, b) => a.resolutionDate - b.resolutionDate),
  new Sort('doneDateDesc', 'Resolution date (desc)', (a, b) => b.resolutionDate - a.resolutionDate)
];

let tasks = [];
let openSort = undefined;
let doneSort = undefined;

function addTask(event) {
  const input = event.target.parentElement.querySelector('input[id=new-task-input]');
  createTask(input);
}
window.addTask = addTask;

function createTask(input) {
  tasks.push(new Task({name: input.value}));
  input.value = '';
  persistTasksToStorage();
  renderTasks(tasks);
}

function removeTask(id) {
  tasks.splice(tasks.indexOf(tasks.find(task => task.id === '' + id)), 1);
  persistTasksToStorage();
  renderTasks(tasks);
}
window.removeTask = removeTask;

function updateTask(id) {
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'task-name-input';
  input.placeholder = 'Changed your mind?...'
  input.addEventListener('keypress', event => {
    if (event.keyCode === 13) {
      // How to delete this ?
      // input.removeEventListener('keypress');
      tasks.find(task => task.id === '' + id).changeTask(event.target.value);
      persistTasksToStorage();
      renderTasks(tasks);
    }
  });
  const listdiv = document.getElementById(`task-${id}`);
  listdiv.innerHTML = '';
  listdiv.appendChild(input);

}
window.updateTask = updateTask;

function search(text) {
  renderTasks(tasks.filter(task => task.name.toLowerCase().includes(text.toLowerCase())));
}

function selectOpenSort() {
  const openSortSelector = document.getElementById('open-tasks-sort');
  openSort = openSortSelector.value;
  persistOpenSortToStorage();
  renderTasks(tasks);
}
window.selectOpenSort = selectOpenSort;

function selectDoneSort() {
  const doneSortSelector = document.getElementById('done-tasks-sort');
  doneSort = doneSortSelector.value;
  persistDoneSortToStorage();
  renderTasks(tasks);
}
window.selectDoneSort = selectDoneSort;

function changeTaskStatus(id) {
  tasks.find(task => {
    return task.id === '' + id;
  }).changeStatus();
  persistTasksToStorage();
  renderTasks(tasks);
}
window.changeTaskStatus = changeTaskStatus;

function getTaskRepresentaion(task) {
  return `<li class="list-group-item">
  <div id="task-row" class="row">
    <div id="check-task" class="col-1">
      <input id="check-task-checkbox}" onchange="changeTaskStatus(${task.id})" type="checkbox" ${task.done ? 'checked' : ''} />
    </div>
    <div id="task-${task.id}" class="col-8" ondblclick='updateTask(${task.id})'>
      <p>${task.name}</p>
    </div>
    <div id="task-time-${task.id}" class="col-2">
      <div>
        <div class='creation-date'>
          ${task.creationDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
        </div>
        <div ${task.done ? '' : 'hidden=true'}'>
          ${task.resolutionDate ? task.resolutionDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : ''}
          </div>
      </div>
    </div>
    <div id="remove-task" class="col-1">
      <button id="delete-task" class="btn btn-outline-secondary" onclick='removeTask(${task.id})'> <i class="fa fa-trash"></i></button>
    </div>
  </div>
</li>
`;
}

function renderTasks(renderTasks) {
  const openTasks = document.getElementById('open-tasks-list');
  const doneTasks = document.getElementById('done-tasks-list');
  openTasks.innerHTML = '';
  doneTasks.innerHTML = '';

  openTasks.innerHTML = renderTasks.filter(task => task.done === false)
    .sort(sortOpenOptions.find(sort => sort.id === openSort).sortFunction)
    .map(task => getTaskRepresentaion(task))
    .join('');
  doneTasks.innerHTML = renderTasks.filter(task => task.done === true)
    .sort(sortDoneOptions.find(sort => sort.id === doneSort).sortFunction)
    .map(task => getTaskRepresentaion(task))
    .join('');
}

function renderSortings() {
  const openSortings = document.getElementById('open-tasks-sort');
  const doneSortings = document.getElementById('done-tasks-sort');

  fillSortings(openSortings, sortOpenOptions, openSort);
  fillSortings(doneSortings, sortDoneOptions, doneSort);
}

function fillSortings(selector, sortingOptions, predefinedSort) {
  sortingOptions.forEach((sort, index) => {
    const element = document.createElement('option');
    element.text = sort.name;
    element.value = sort.id;
    selector.add(element);
    if (sort.id === predefinedSort) {
      selector[index].selected = true;
    }
  });
}

function persistTasksToStorage() {
  window.localStorage.setItem('tasks', JSON.stringify(tasks));
};

function persistOpenSortToStorage() {
  window.localStorage.setItem('openSort', openSort);
};

function persistDoneSortToStorage() {
  window.localStorage.setItem('doneSort', doneSort);
};

function loadFromStorage() {
  const tasksJson = window.localStorage.getItem('tasks');
  openSort = window.localStorage.getItem('openSort') || sortOpenOptions[0].id;
  doneSort = window.localStorage.getItem('doneSort') || sortDoneOptions[0].id;
  if (tasksJson) {
    tasks = JSON.parse(tasksJson).map(obj => new Task(obj));
  }
};

loadFromStorage();
renderSortings();
renderTasks(tasks);

document.querySelector('input[id=new-task-input]').addEventListener('keypress', event => {
  if (event.keyCode === 13) {
    createTask(event.target);
  }
});

document.querySelector('input[id=search-task]').addEventListener('keypress', event => {
  if (event.keyCode === 13) {
    search(event.target.value);
  }
});

document.onkeydown = event => {
  if (event.keyCode === 27) {
    event.target.value = '';
    if (document.querySelectorAll('#task-name-input')) {
      renderTasks(tasks);
    }
  }
}

document.querySelector('#remove-open-button').addEventListener('mousedown', event => {
  tasks = tasks.filter(task => task.done === true);
  persistTasksToStorage();
  renderTasks(tasks);
})

document.querySelector('#remove-done-button').addEventListener('mousedown', event => {
  tasks = tasks.filter(task => task.done !== true);
  persistTasksToStorage();
  renderTasks(tasks);
})
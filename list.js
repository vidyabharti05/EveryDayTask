let tasks = [];

// Load saved tasks
document.addEventListener("DOMContentLoaded", () => {
  const storedTasks = JSON.parse(localStorage.getItem("tasks"));
  if (storedTasks) {
    tasks = storedTasks;
    updateTasksList();
    updateStats();
  }
});

const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

const addTask = () => {
  const taskInput = document.getElementById("taskInput");
  const timeInput = document.getElementById("taskTime");
  const text = taskInput.value.trim();
  const time = timeInput.value;

  if (text && time) {
    tasks.push({
      text: text,
      completed: false,
      time: time, // "HH:MM"
      id: Date.now(),
      notified: false,
    });
    taskInput.value = "";
    timeInput.value = "";
    updateTasksList();
    updateStats();
    saveTasks();
  }
};

const toggleTaskComplete = (index) => {
  tasks[index].completed = !tasks[index].completed;
  updateTasksList();
  updateStats();
  saveTasks();
};

const deleteTask = (index) => {
  tasks.splice(index, 1);
  updateTasksList();
  updateStats();
  saveTasks();
};

const editTask = (index) => {
  const taskInput = document.getElementById("taskInput");
  const timeInput = document.getElementById("taskTime");
  taskInput.value = tasks[index].text;
  timeInput.value = tasks[index].time;
  tasks.splice(index, 1);
  updateTasksList();
  updateStats();
  saveTasks();
};

const updateStats = () => {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;

  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const progressBar = document.getElementById("progress");
  progressBar.style.width = `${progress}%`;
  document.getElementById("numbers").innerText = `${completedTasks}/${totalTasks}`;

  if (tasks.length > 0 && completedTasks === totalTasks) {
    blastconfetti();
  }
};

const updateTasksList = () => {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <div class="taskItem">
        <div class="task ${task.completed ? "completed" : ""}">
          <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""}/>
          <p>${task.text} - <small>${task.time}</small></p>
        </div>
        <div class="icon">
          <img src="download (1).png" alt="edit" onclick="editTask(${index})"/>
          <img src="download.png" alt="delete" onclick="deleteTask(${index})"/>
        </div>
      </div>
    `;
    listItem.querySelector(".checkbox").addEventListener("change", () => toggleTaskComplete(index));
    taskList.appendChild(listItem);
  });
};

document.getElementById("newTask").addEventListener("click", function (e) {
  e.preventDefault();
  addTask();
});

window.editTask = editTask;
window.deleteTask = deleteTask;

// 🎉 Confetti function
const blastconfetti = () => {
  const count = 200,
    defaults = { origin: { y: 0.7 } };

  function fire(particleRatio, opts) {
    confetti(Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio),
    }));
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
};

// 🔔 Check for alarm every 30 seconds
setInterval(() => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM

  tasks.forEach((task) => {
    if (!task.completed && !task.notified && task.time === currentTime) {
      showNotification(task.text);
      playAlarm();
      task.notified = true; // to avoid repeat
      saveTasks();
    }
  });
}, 30000);

// Alarm sound
function playAlarm() {
  const audio = new Audio("mixkit-urgent-simple-tone-loop-2976.wav");
  audio.play();
}

// Browser notification
function showNotification(taskText) {
  if (Notification.permission === "granted") {
    new Notification("Reminder!", {
      body: `Time for: ${taskText}`,
      icon: "download (2).png",
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") showNotification(taskText);
    });
  }
}

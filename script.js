
document.addEventListener("DOMContentLoaded", () => {

    // STORAGE
    const STORAGE_KEYS = {
        tasks: "studentOS_tasks_v1",
        notes: "studentOS_notes_v1",
        sessions: "studentOS_sessions_v1",
        theme: "studentOS_theme_v1"
    };

    function loadData(key, fallback) {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : fallback;
        } catch (error) {
            console.error("Could not load saved data:", error);
            return fallback;
        }
    }

    function saveData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // TASKS
    const taskForm = document.getElementById("taskForm");
    const taskInput = document.getElementById("taskInput");
    const taskList = document.getElementById("taskList");

    let tasks = loadData(STORAGE_KEYS.tasks, []);

    function renderTasks() {
        taskList.innerHTML = "";

        if (tasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <span>✦</span>
                    <p>No tasks yet. Add your first task!</p>
                </div>
            `;
        }

        tasks.forEach(task => {
            const item = document.createElement("div");
            item.className = `task-item ${task.completed ? "completed" : ""}`;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.completed;
            checkbox.setAttribute("aria-label", "Complete task");

            checkbox.addEventListener("change", () => {
                task.completed = checkbox.checked;
                saveData(STORAGE_KEYS.tasks, tasks);
                renderTasks();
                updateStats();
            });

            const title = document.createElement("span");
            title.textContent = task.text;

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-task";
            deleteButton.textContent = "×";
            deleteButton.setAttribute("aria-label", "Delete task");

            deleteButton.addEventListener("click", () => {
                tasks = tasks.filter(t => t.id !== task.id);
                saveData(STORAGE_KEYS.tasks, tasks);
                renderTasks();
                updateStats();
            });

            item.append(checkbox, title, deleteButton);
            taskList.appendChild(item);
        });

        updateStats();
    }

    taskForm.addEventListener("submit", event => {
        event.preventDefault();

        const text = taskInput.value.trim();

        if (!text) return;

        tasks.push({
            id: Date.now() + Math.random(),
            text,
            completed: false
        });

        saveData(STORAGE_KEYS.tasks, tasks);

        taskInput.value = "";
        renderTasks();
        taskInput.focus();
    });

    // ADD TASK BUTTON
    document.getElementById("addTaskButton").addEventListener("click", () => {
        taskInput.focus();
        taskInput.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });

    // PRODUCTIVITY STATISTICS
    const completedCount = document.getElementById("completedCount");
    const pendingCount = document.getElementById("pendingCount");
    const productivityValue = document.getElementById("productivityValue");
    const progressPercentage = document.getElementById("progressPercentage");
    const progressDone = document.getElementById("progressDone");
    const progressLeft = document.getElementById("progressLeft");
    const progressCircle = document.getElementById("progressCircle");

    function updateStats() {
        const completed = tasks.filter(task => task.completed).length;
        const pending = tasks.length - completed;

        const percentage = tasks.length
            ? Math.round((completed / tasks.length) * 100)
            : 0;

        completedCount.textContent = completed;
        pendingCount.textContent = pending;
        productivityValue.textContent = percentage + "%";

        progressPercentage.textContent = percentage + "%";
        progressDone.textContent = completed;
        progressLeft.textContent = pending;

        progressCircle.style.background =
            `conic-gradient(var(--purple) ${percentage}%, #273047 ${percentage}%)`;
    }

    // FOCUS TIMER
    const timerDisplay = document.getElementById("timerDisplay");
    const startButton = document.getElementById("startTimer");
    const resetButton = document.getElementById("resetTimer");
    const sessionCount = document.getElementById("sessionCount");

    const FOCUS_DURATION = 25 * 60;

    let remainingSeconds = FOCUS_DURATION;
    let timerInterval = null;
    let sessions = loadData(STORAGE_KEYS.sessions, 0);

    sessionCount.textContent = sessions;

    function updateTimerDisplay() {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;

        timerDisplay.textContent =
            String(minutes).padStart(2, "0") + ":" +
            String(seconds).padStart(2, "0");
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        startButton.textContent = "Start";
    }

    function startTimer() {
        if (timerInterval) return;

        startButton.textContent = "Pause";

        timerInterval = setInterval(() => {
            remainingSeconds--;
            updateTimerDisplay();

            if (remainingSeconds <= 0) {
                stopTimer();

                sessions++;
                saveData(STORAGE_KEYS.sessions, sessions);
                sessionCount.textContent = sessions;

                remainingSeconds = FOCUS_DURATION;
                updateTimerDisplay();

                alert("Focus session completed! Great work. 🎉");
            }
        }, 1000);
    }

    startButton.addEventListener("click", () => {
        if (timerInterval) {
            stopTimer();
        } else {
            startTimer();
        }
    });

    resetButton.addEventListener("click", () => {
        stopTimer();
        remainingSeconds = FOCUS_DURATION;
        updateTimerDisplay();
    });

    // QUICK NOTES
    const notesInput = document.getElementById("notesInput");
    const clearNotes = document.getElementById("clearNotes");
    const notesStatus = document.getElementById("notesStatus");

    notesInput.value = localStorage.getItem(STORAGE_KEYS.notes) || "";

    let notesSaveTimeout;

    notesInput.addEventListener("input", () => {
        notesStatus.textContent = "Saving...";

        clearTimeout(notesSaveTimeout);

        notesSaveTimeout = setTimeout(() => {
            localStorage.setItem(STORAGE_KEYS.notes, notesInput.value);
            notesStatus.textContent = "Saved locally ✓";
        }, 300);
    });

    clearNotes.addEventListener("click", () => {
        if (!notesInput.value.trim()) return;

        if (confirm("Are you sure you want to clear all your notes?")) {
            notesInput.value = "";
            localStorage.removeItem(STORAGE_KEYS.notes);
            notesStatus.textContent = "Notes cleared";
        }
    });

    // DARK / LIGHT THEME
    const themeToggle = document.getElementById("themeToggle");

    function applyTheme(theme) {
        document.body.classList.toggle("light-theme", theme === "light");
        themeToggle.textContent = theme === "light" ? "☀" : "◐";
        themeToggle.setAttribute(
            "aria-label",
            theme === "light" ? "Switch to dark theme" : "Switch to light theme"
        );
    }

    let currentTheme = localStorage.getItem(STORAGE_KEYS.theme) || "dark";

    applyTheme(currentTheme);

    themeToggle.addEventListener("click", () => {
        currentTheme = currentTheme === "dark" ? "light" : "dark";

        localStorage.setItem(STORAGE_KEYS.theme, currentTheme);
        applyTheme(currentTheme);
    });

    // INITIALIZE APP
    renderTasks();
    updateTimerDisplay();

});

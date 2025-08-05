class TodoApp {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("todoTasks")) || []
    this.currentFilter = "all"
    this.taskIdCounter = this.tasks.length > 0 ? Math.max(...this.tasks.map((t) => t.id)) + 1 : 1

    this.initializeElements()
    this.attachEventListeners()
    this.renderTasks()
    this.updateStats()
  }

  initializeElements() {
    this.taskInput = document.getElementById("taskInput")
    this.addBtn = document.getElementById("addBtn")
    this.taskList = document.getElementById("taskList")
    this.emptyState = document.getElementById("emptyState")
    this.totalTasks = document.getElementById("totalTasks")
    this.completedTasks = document.getElementById("completedTasks")
    this.pendingTasks = document.getElementById("pendingTasks")
    this.filterBtns = document.querySelectorAll(".filter-btn")
  }

  attachEventListeners() {
    // Add task event listeners
    this.addBtn.addEventListener("click", () => this.addTask())
    this.taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addTask()
      }
    })

    // Filter event listeners
    this.filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.setFilter(e.target.dataset.filter)
      })
    })

    // Task list event delegation
    this.taskList.addEventListener("click", (e) => {
      const taskItem = e.target.closest(".task-item")
      if (!taskItem) return

      const taskId = Number.parseInt(taskItem.dataset.taskId)

      if (e.target.classList.contains("task-checkbox")) {
        this.toggleTask(taskId)
      } else if (e.target.classList.contains("delete-btn")) {
        this.deleteTask(taskId)
      }
    })
  }

  addTask() {
    const taskText = this.taskInput.value.trim()

    if (taskText === "") {
      this.showInputError()
      return
    }

    const newTask = {
      id: this.taskIdCounter++,
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    this.tasks.unshift(newTask) // Add to beginning for newest first
    this.taskInput.value = ""
    this.saveToLocalStorage()
    this.renderTasks()
    this.updateStats()

    // Show success feedback
    this.showAddSuccess()
  }

  toggleTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (task) {
      task.completed = !task.completed
      this.saveToLocalStorage()
      this.renderTasks()
      this.updateStats()
    }
  }

  deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
      this.tasks = this.tasks.filter((t) => t.id !== taskId)
      this.saveToLocalStorage()
      this.renderTasks()
      this.updateStats()
    }
  }

  setFilter(filter) {
    this.currentFilter = filter

    // Update active filter button
    this.filterBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter)
    })

    this.renderTasks()
  }

  getFilteredTasks() {
    switch (this.currentFilter) {
      case "completed":
        return this.tasks.filter((task) => task.completed)
      case "pending":
        return this.tasks.filter((task) => !task.completed)
      default:
        return this.tasks
    }
  }

  renderTasks() {
    const filteredTasks = this.getFilteredTasks()

    if (filteredTasks.length === 0) {
      this.taskList.innerHTML = ""
      this.emptyState.classList.remove("hidden")
      return
    }

    this.emptyState.classList.add("hidden")

    this.taskList.innerHTML = filteredTasks
      .map(
        (task) => `
            <li class="task-item ${task.completed ? "completed" : ""}" data-task-id="${task.id}">
                <div class="task-checkbox ${task.completed ? "checked" : ""}"></div>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="delete-btn">Delete</button>
                </div>
            </li>
        `,
      )
      .join("")
  }

  updateStats() {
    const total = this.tasks.length
    const completed = this.tasks.filter((task) => task.completed).length
    const pending = total - completed

    this.totalTasks.textContent = `Total: ${total}`
    this.completedTasks.textContent = `Completed: ${completed}`
    this.pendingTasks.textContent = `Pending: ${pending}`
  }

  saveToLocalStorage() {
    localStorage.setItem("todoTasks", JSON.stringify(this.tasks))
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  showInputError() {
    this.taskInput.style.borderColor = "#dc3545"
    this.taskInput.placeholder = "Please enter a task!"

    setTimeout(() => {
      this.taskInput.style.borderColor = "#e9ecef"
      this.taskInput.placeholder = "Enter a new task..."
    }, 2000)
  }

  showAddSuccess() {
    const originalBg = this.addBtn.style.background
    this.addBtn.style.background = "#28a745"
    this.addBtn.textContent = "Added!"

    setTimeout(() => {
      this.addBtn.style.background = originalBg
      this.addBtn.textContent = "Add Task"
    }, 1000)
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TodoApp()
})

// Add some sample tasks for demonstration (remove in production)
window.addEventListener("load", () => {
  const app = document.querySelector(".container")
  if (localStorage.getItem("todoTasks") === null) {
    // Add sample tasks only if no existing tasks
    setTimeout(() => {
      const sampleTasks = ["Complete the project documentation", "Review code changes", "Plan next sprint meeting"]

      // This is just for demo - you can remove this section
      console.log("Sample tasks available:", sampleTasks)
    }, 1000)
  }
})

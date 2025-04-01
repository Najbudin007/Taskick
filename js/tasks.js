// tasks.js - Updated version with editing mode, toast notifications,
// dynamic jokes fetched from JokeAPI, and pagination after 8 tasks

let editingTaskId = null // Global variable to track the task being edited
let currentPage = 1
const tasksPerPage = 8

// Toast notification function with dismiss button and updated duration
function showToast(message, duration = 5000) {
  const toast = document.createElement("div")
  toast.className = "toast"

  // Message container
  const messageSpan = document.createElement("span")
  messageSpan.textContent = message

  // Close button
  const closeBtn = document.createElement("button")
  closeBtn.className = "toast-close"
  closeBtn.textContent = "×"
  closeBtn.addEventListener("click", () => {
    toast.remove()
  })

  toast.appendChild(messageSpan)
  toast.appendChild(closeBtn)
  document.body.appendChild(toast)

  // Auto fade out
  setTimeout(() => {
    toast.classList.add("fade-out")
  }, duration - 500)

  setTimeout(() => {
    if (toast.parentElement) toast.remove()
  }, duration)
}

// Fetch a joke from JokeAPI based on humor level
function fetchJokeFromAPI(humorLevel) {
  let category = "Programming"
  if (humorLevel < 33) {
    category = "Pun"
  } else if (humorLevel < 66) {
    category = "Programming"
  } else {
    category = "Any"
  }
  const url = `https://v2.jokeapi.dev/joke/${category}?type=single`
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.joke) {
        return data.joke
      } else {
        return "Couldn't fetch a joke right now."
      }
    })
    .catch((err) => "Couldn't fetch a joke right now.")
}

document.addEventListener("DOMContentLoaded", () => {
  loadTasks()

  // Immediately check for reminders when page loads
  checkReminders()

  // Add task button
  const addTaskBtn = document.getElementById("add-task-btn")
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", openTaskModal)
  }

  // Save task button
  const saveTaskBtn = document.getElementById("save-task-btn")
  if (saveTaskBtn) {
    saveTaskBtn.addEventListener("click", saveTask)
  }

  // Close modal
  const closeBtn = document.querySelector(".close")
  if (closeBtn) {
    closeBtn.addEventListener("click", closeTaskModal)
  }

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("task-modal")
    if (event.target === modal) {
      closeTaskModal()
    }

    const reminderModal = document.getElementById("reminder-modal")
    if (event.target === reminderModal) {
      closeReminderModal()
    }
  })

  // Priority dropdown
  const prioritySelected = document.getElementById("priority-selected")
  const priorityOptions = document.getElementById("priority-options")

  if (prioritySelected) {
    prioritySelected.addEventListener("click", () => {
      priorityOptions.classList.toggle("show")
    })
  }

  // Priority options
  const priorityOptionElements = document.querySelectorAll(".priority-option")
  if (priorityOptionElements.length > 0) {
    priorityOptionElements.forEach((option) => {
      option.addEventListener("click", function () {
        const priority = this.dataset.priority
        updateSelectedPriority(priority)
        priorityOptions.classList.remove("show")
      })
    })
  }

  // Close priority dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (priorityOptions && !event.target.closest(".priority-dropdown")) {
      priorityOptions.classList.remove("show")
    }
  })

  // Date selector
  const dateSelector = document.getElementById("date-selector")
  const datePicker = document.getElementById("date-picker")

  if (dateSelector) {
    dateSelector.addEventListener("click", () => {
      datePicker.classList.toggle("show")
    })
  }

  // Date input
  const dateInput = document.getElementById("task-date")
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0]
    dateInput.addEventListener("change", function () {
      const date = new Date(this.value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let dateText = "Today"
      if (date.toDateString() === today.toDateString()) {
        dateText = "Today"
      } else if (date.getTime() === today.getTime() + 86400000) {
        dateText = "Tomorrow"
      } else {
        dateText = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      }

      document.getElementById("selected-date").textContent = dateText
      datePicker.classList.remove("show")
    })
  }

  // Add subtask button
  const addSubtaskBtn = document.getElementById("add-subtask-btn")
  if (addSubtaskBtn) {
    addSubtaskBtn.addEventListener("click", addSubtask)
  }

  // Add comment button
  const addCommentBtn = document.getElementById("add-comment")
  if (addCommentBtn) {
    addCommentBtn.addEventListener("click", addComment)
  }

  // Cancel comment button
  const cancelCommentBtn = document.getElementById("cancel-comment")
  if (cancelCommentBtn) {
    cancelCommentBtn.addEventListener("click", () => {
      document.getElementById("comment-input").value = ""
    })
  }

  // Add reminder button
  const addReminderBtn = document.getElementById("add-reminder-btn")
  if (addReminderBtn) {
    addReminderBtn.addEventListener("click", openReminderModal)
  }

  // Reminder modal close button
  const reminderCloseBtn = document.querySelector(".reminder-close")
  if (reminderCloseBtn) {
    reminderCloseBtn.addEventListener("click", closeReminderModal)
  }

  // Reminder tabs
  const reminderTabs = document.querySelectorAll(".reminder-tab")
  if (reminderTabs.length > 0) {
    reminderTabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        // Remove active class from all tabs
        reminderTabs.forEach((t) => t.classList.remove("active"))

        // Add active class to clicked tab
        this.classList.add("active")

        // Show corresponding content
        const type = this.dataset.type
        document.getElementById("date-time-option").style.display = type === "date" ? "block" : "none"
        document.getElementById("before-task-option").style.display = type === "before" ? "block" : "none"
      })
    })
  }

  // Save reminder button
  const saveReminderBtn = document.getElementById("save-reminder")
  if (saveReminderBtn) {
    saveReminderBtn.addEventListener("click", saveReminder)
  }

  // Cancel reminder button
  const cancelReminderBtn = document.getElementById("cancel-reminder")
  if (cancelReminderBtn) {
    cancelReminderBtn.addEventListener("click", closeReminderModal)
  }

  // Check for reminders immediately when page loads
  checkReminders()

  // Set up more frequent reminder checks (every 15 seconds)
  setInterval(checkReminders, 15000)
})

function updateSelectedPriority(priority) {
  const prioritySelected = document.getElementById("priority-selected")
  if (prioritySelected) {
    prioritySelected.innerHTML = `<i class="fas fa-flag priority-flag p${priority}"></i> P${priority}`
    prioritySelected.dataset.priority = priority

    // Update selected option
    document.querySelectorAll(".priority-option").forEach((option) => {
      if (option.dataset.priority === priority) {
        option.classList.add("selected")
      } else {
        option.classList.remove("selected")
      }
    })
  }
}

function loadTasks() {
  const taskList = document.getElementById("task-list")
  if (!taskList) return

  const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  const allTasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || []

  // Sort tasks by deadline
  allTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))

  // Determine total pages
  const totalPages = Math.ceil(allTasks.length / tasksPerPage) || 1

  // Ensure currentPage is within bounds
  if (currentPage > totalPages) {
    currentPage = totalPages
  }

  // Slice tasks for current page
  const startIndex = (currentPage - 1) * tasksPerPage
  const tasksToDisplay = allTasks.slice(startIndex, startIndex + tasksPerPage)

  // Clear task list
  taskList.innerHTML = ""

  // Add tasks for current page to the list
  tasksToDisplay.forEach((task) => {
    const taskItem = createTaskElement(task)
    taskList.appendChild(taskItem)
  })

  if (taskList.children.length === 0) {
    taskList.innerHTML = '<div class="empty-state">No tasks yet. Add a new task to get started!</div>'
  }

  // Render pagination controls if needed
  if (totalPages > 1) {
    renderPagination(totalPages)
  } else {
    const paginationContainer = document.getElementById("pagination")
    if (paginationContainer) paginationContainer.remove()
  }
}

function renderPagination(totalPages) {
  let paginationContainer = document.getElementById("pagination")
  if (!paginationContainer) {
    paginationContainer = document.createElement("div")
    paginationContainer.id = "pagination"
    paginationContainer.className = "pagination"
    // Append after the task list container
    const taskList = document.getElementById("task-list")
    taskList.parentNode.insertBefore(paginationContainer, taskList.nextSibling)
  }
  // Clear existing pagination
  paginationContainer.innerHTML = ""

  // Previous button
  const prevBtn = document.createElement("button")
  prevBtn.textContent = "Previous"
  prevBtn.disabled = currentPage === 1
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--
      loadTasks()
    }
  })
  paginationContainer.appendChild(prevBtn)

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button")
    pageBtn.textContent = i
    if (i === currentPage) {
      pageBtn.classList.add("active")
    }
    pageBtn.addEventListener("click", () => {
      currentPage = i
      loadTasks()
    })
    paginationContainer.appendChild(pageBtn)
  }

  // Next button
  const nextBtn = document.createElement("button")
  nextBtn.textContent = "Next"
  nextBtn.disabled = currentPage === totalPages
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++
      loadTasks()
    }
  })
  paginationContainer.appendChild(nextBtn)
}

function createTaskElement(task) {
  const taskItem = document.createElement("div")
  taskItem.className = "task-item"
  if (task.priority) {
    taskItem.classList.add(`priority-${task.priority}`)
  } else {
    taskItem.classList.add("priority-4") // Default priority
  }
  taskItem.dataset.id = task.id

  const checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  checkbox.className = "task-checkbox"
  checkbox.checked = task.completed
  checkbox.addEventListener("change", () => {
    toggleTaskCompletion(task.id)
  })

  const content = document.createElement("div")
  content.className = "task-content"

  const title = document.createElement("div")
  title.className = "task-title"
  title.textContent = task.title
  // Add line-through style for completed tasks
  if (task.completed) {
    title.style.textDecoration = "line-through"
    title.style.color = "#999"
  }

  const deadline = document.createElement("div")
  deadline.className = "task-deadline"
  deadline.textContent = `Deadline: ${formatDate(task.deadline)}`

  content.appendChild(title)
  content.appendChild(deadline)

  const actions = document.createElement("div")
  actions.className = "task-actions"

  const editBtn = document.createElement("button")
  editBtn.className = "btn btn-icon"
  editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>'
  editBtn.title = "Edit"
  editBtn.addEventListener("click", () => {
    editTask(task.id)
  })

  const deleteBtn = document.createElement("button")
  deleteBtn.className = "btn btn-icon btn-danger"
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'
  deleteBtn.title = "Delete"
  deleteBtn.addEventListener("click", () => {
    deleteTask(task.id)
  })

  actions.appendChild(editBtn)
  actions.appendChild(deleteBtn)

  taskItem.appendChild(checkbox)
  taskItem.appendChild(content)
  taskItem.appendChild(actions)

  return taskItem
}

function openTaskModal() {
  editingTaskId = null // Reset editing mode if adding a new task
  const modal = document.getElementById("task-modal")
  modal.style.display = "block"

  // Update modal title
  document.getElementById("modal-title").textContent = "Add New Task"

  // Clear form
  document.getElementById("task-title").value = ""
  document.getElementById("task-description").value = ""
  document.getElementById("task-deadline").value = new Date().toISOString().split("T")[0]
  document.getElementById("task-date").value = new Date().toISOString().split("T")[0]
  document.getElementById("selected-date").textContent = "Today"

  // Clear subtasks
  document.getElementById("subtasks-container").innerHTML = ""

  // Clear comments
  document.getElementById("comments-container").innerHTML = ""

  // Clear reminders
  document.getElementById("reminders-container").innerHTML = ""

  // Reset priority to default (P4)
  updateSelectedPriority("4")

  document.getElementById("task-title").focus()
}

function closeTaskModal() {
  const modal = document.getElementById("task-modal")
  modal.style.display = "none"
}

function openReminderModal() {
  const modal = document.getElementById("reminder-modal")
  modal.style.display = "block"

  // Set default date and time
  const now = new Date()
  const dateStr = now.toISOString().split("T")[0]
  let hours = now.getHours()
  let minutes = now.getMinutes()

  // Round to nearest 15 minutes
  minutes = Math.ceil(minutes / 15) * 15
  if (minutes === 60) {
    minutes = 0
    hours += 1
  }

  const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

  document.getElementById("reminder-date").value = dateStr
  document.getElementById("reminder-time").value = timeStr

  // Reset tabs
  document.querySelectorAll(".reminder-tab").forEach((tab) => {
    tab.classList.remove("active")
  })
  document.querySelector('.reminder-tab[data-type="date"]').classList.add("active")

  // Show date-time option
  document.getElementById("date-time-option").style.display = "block"
  document.getElementById("before-task-option").style.display = "none"
}

function closeReminderModal() {
  const modal = document.getElementById("reminder-modal")
  modal.style.display = "none"
}

function saveReminder() {
  const activeTab = document.querySelector(".reminder-tab.active")
  const type = activeTab.dataset.type

  let reminderText = ""
  let reminderData = {}

  if (type === "date") {
    const date = document.getElementById("reminder-date").value
    const time = document.getElementById("reminder-time").value

    if (!date || !time) {
      showToast("Please select both date and time")
      return
    }

    const reminderDate = new Date(`${date}T${time}`)
    const formattedDate = reminderDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: reminderDate.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    })
    const formattedTime = reminderDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    reminderText = `${formattedDate} at ${formattedTime}`
    reminderData = { type: "date", date, time }
  } else {
    const beforeValue = document.getElementById("reminder-before").value
    const beforeText =
      document.getElementById("reminder-before").options[document.getElementById("reminder-before").selectedIndex].text

    reminderText = beforeText
    reminderData = { type: "before", value: beforeValue }
  }

  addReminderToTask(reminderText, reminderData)
  closeReminderModal()
}

function addReminderToTask(text, data) {
  const remindersContainer = document.getElementById("reminders-container")

  const reminderItem = document.createElement("div")
  reminderItem.className = "reminder-item"

  const reminderInfo = document.createElement("div")
  reminderInfo.className = "reminder-info"

  const icon = document.createElement("i")
  icon.className = "fas fa-bell"

  const reminderText = document.createElement("span")
  reminderText.textContent = text

  reminderInfo.appendChild(icon)
  reminderInfo.appendChild(reminderText)

  const deleteBtn = document.createElement("i")
  deleteBtn.className = "fas fa-times reminder-delete"
  deleteBtn.addEventListener("click", () => {
    reminderItem.remove()
  })

  reminderItem.appendChild(reminderInfo)
  reminderItem.appendChild(deleteBtn)

  // Store reminder data
  reminderItem.dataset.type = data.type
  if (data.type === "date") {
    reminderItem.dataset.date = data.date
    reminderItem.dataset.time = data.time
  } else {
    reminderItem.dataset.value = data.value
  }

  remindersContainer.appendChild(reminderItem)
}

function addSubtask() {
  const subtasksContainer = document.getElementById("subtasks-container")

  const subtaskItem = document.createElement("div")
  subtaskItem.className = "subtask-item"

  const checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  checkbox.className = "subtask-checkbox"

  const input = document.createElement("input")
  input.type = "text"
  input.className = "subtask-content"
  input.placeholder = "Subtask"

  const deleteBtn = document.createElement("button")
  deleteBtn.className = "subtask-delete-btn"
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'
  deleteBtn.addEventListener("click", () => {
    subtaskItem.remove()
  })

  subtaskItem.appendChild(checkbox)
  subtaskItem.appendChild(input)
  subtaskItem.appendChild(deleteBtn)

  subtasksContainer.appendChild(subtaskItem)

  // Focus the new input
  input.focus()
}

function addComment() {
  const commentInput = document.getElementById("comment-input")
  const commentText = commentInput.value.trim()

  if (!commentText) return

  const commentsContainer = document.getElementById("comments-container")

  const commentItem = document.createElement("div")
  commentItem.className = "comment-item"

  const commentHeader = document.createElement("div")
  commentHeader.className = "comment-header"

  const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))

  const commentAuthor = document.createElement("div")
  commentAuthor.className = "comment-author"
  commentAuthor.textContent = currentUser.name

  const commentDate = document.createElement("div")
  commentDate.className = "comment-date"
  commentDate.textContent = new Date().toLocaleString()

  commentHeader.appendChild(commentAuthor)
  commentHeader.appendChild(commentDate)

  const commentTextElement = document.createElement("div")
  commentTextElement.className = "comment-text"
  commentTextElement.textContent = commentText

  commentItem.appendChild(commentHeader)
  commentItem.appendChild(commentTextElement)

  commentsContainer.appendChild(commentItem)

  // Clear input
  commentInput.value = ""
}

function saveTask() {
  const title = document.getElementById("task-title").value
  const deadline = document.getElementById("task-deadline").value
  const description = document.getElementById("task-description").value
  const date = document.getElementById("task-date").value
  const prioritySelected = document.getElementById("priority-selected")
  const priority = prioritySelected ? prioritySelected.dataset.priority || "4" : "4"

  if (!title) {
    alert("Please enter a task title")
    return
  }

  // Get subtasks
  const subtasksContainer = document.getElementById("subtasks-container")
  const subtaskItems = subtasksContainer.querySelectorAll(".subtask-item")
  const subtasks = Array.from(subtaskItems)
    .map((item) => {
      return {
        text: item.querySelector(".subtask-content").value,
        completed: item.querySelector(".subtask-checkbox").checked,
      }
    })
    .filter((subtask) => subtask.text.trim() !== "")

  // Get comments
  const commentsContainer = document.getElementById("comments-container")
  const commentItems = commentsContainer.querySelectorAll(".comment-item")
  const comments = Array.from(commentItems).map((item) => {
    return {
      author: item.querySelector(".comment-author").textContent,
      date: item.querySelector(".comment-date").textContent,
      text: item.querySelector(".comment-text").textContent,
    }
  })

  // Get reminders
  const remindersContainer = document.getElementById("reminders-container")
  const reminderItems = remindersContainer.querySelectorAll(".reminder-item")
  const reminders = Array.from(reminderItems).map((item) => {
    const type = item.dataset.type
    if (type === "date") {
      return {
        type: "date",
        date: item.dataset.date,
        time: item.dataset.time,
        text: item.querySelector("span").textContent,
      }
    } else {
      return {
        type: "before",
        value: item.dataset.value,
        text: item.querySelector("span").textContent,
      }
    }
  })

  const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || []

  if (editingTaskId) {
    // Update the existing task
    const taskIndex = tasks.findIndex((t) => t.id === editingTaskId)
    if (taskIndex !== -1) {
      tasks[taskIndex].title = title
      tasks[taskIndex].deadline = deadline
      tasks[taskIndex].description = description
      tasks[taskIndex].date = date
      tasks[taskIndex].priority = priority
      tasks[taskIndex].subtasks = subtasks
      tasks[taskIndex].comments = comments
      tasks[taskIndex].reminders = reminders
    }
    editingTaskId = null // Reset editing mode
    showToast("Task updated!")
  } else {
    // Add a new task
    const newTaskData = {
      id: Date.now().toString(),
      title,
      deadline,
      description,
      date,
      priority,
      subtasks,
      comments,
      reminders,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    tasks.push(newTaskData)

    // Fetch a joke from the API based on humor level and show it as toast
    fetchJokeFromAPI(currentUser.humorLevel || 50).then((joke) => {
      showToast(joke)
    })
  }

  localStorage.setItem(`taskick_tasks_${currentUser.id}`, JSON.stringify(tasks))

  // Dispatch custom event to notify progress page of updates
  window.dispatchEvent(new Event("taskUpdated"))

  // Check for reminders immediately after saving
  setTimeout(checkReminders, 500)

  closeTaskModal()
  loadTasks()
}

// Check for due reminders every 15 seconds (more frequent checks)
setInterval(checkReminders, 15000)

// Modify the checkReminders function to add 5-minute interval reminders
function checkReminders() {
  const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  if (!currentUser) return

  const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || []
  const now = new Date()

  console.log("Checking reminders at:", now.toLocaleString())

  tasks.forEach((task) => {
    if (!task.reminders || task.reminders.length === 0) return

    // Skip completed tasks
    if (task.completed) return

    // Check deadline for escalating reminders
    if (task.deadline) {
      const deadlineTime = new Date(task.deadline)

      // Add time component if not present (default to end of day)
      if (deadlineTime.getHours() === 0 && deadlineTime.getMinutes() === 0 && deadlineTime.getSeconds() === 0) {
        deadlineTime.setHours(23, 59, 59)
      }

      // Calculate minutes until deadline
      const minutesUntilDeadline = Math.floor((deadlineTime - now) / 60000)

      // Show escalating reminders at 30, 15, 10, and every 5 minutes before deadline
      if (minutesUntilDeadline > 0 && minutesUntilDeadline <= 30) {
        // Check if it's exactly 30, 15, or 10 minutes before deadline
        if (minutesUntilDeadline === 30 || minutesUntilDeadline === 15 || minutesUntilDeadline === 10) {
          console.log(`SHOWING ESCALATING REMINDER for ${task.title}: ${minutesUntilDeadline} minutes until deadline`)
          showReminderNotification(task.title, `Due in ${minutesUntilDeadline} minutes!`)
        }
        // Or if it's a multiple of 5 minutes (5, 10, 15, 20, 25, 30)
        else if (minutesUntilDeadline % 5 === 0) {
          console.log(
            `SHOWING 5-MIN INTERVAL REMINDER for ${task.title}: ${minutesUntilDeadline} minutes until deadline`,
          )
          showReminderNotification(task.title, `Due in ${minutesUntilDeadline} minutes!`)
        }
      }
    }

    task.reminders.forEach((reminder) => {
      if (reminder.type === "date") {
        // For date & time specific reminders
        const reminderTime = new Date(`${reminder.date}T${reminder.time}`)

        // Debug log
        console.log(
          `Task: ${task.title}, Date reminder: ${reminderTime.toLocaleString()}, Now: ${now.toLocaleString()}, Diff (ms): ${Math.abs(now - reminderTime)}`,
        )

        // For testing: Force show the reminder if it's within 10 minutes
        const timeDiff = Math.abs(now - reminderTime)

        // Check if reminder time is now (within 10 minutes for testing)
        if (timeDiff < 600000) {
          // 10 minutes in milliseconds
          console.log("SHOWING DATE REMINDER for", task.title)
          showReminderNotification(task.title, reminder.text)
        }
      } else if (reminder.type === "before") {
        // For "X minutes before deadline" reminders
        if (!task.deadline) return

        // Create a proper date object from the deadline
        const deadlineTime = new Date(task.deadline)

        // Add time component if not present (default to end of day)
        if (deadlineTime.getHours() === 0 && deadlineTime.getMinutes() === 0 && deadlineTime.getSeconds() === 0) {
          deadlineTime.setHours(23, 59, 59)
        }

        const minutesBefore = Number.parseInt(reminder.value)
        const reminderTime = new Date(deadlineTime.getTime() - minutesBefore * 60000)

        // Debug log with more details
        console.log(
          `Task: ${task.title}, Deadline: ${deadlineTime.toLocaleString()}, Before reminder: ${reminderTime.toLocaleString()}, Now: ${now.toLocaleString()}, Diff (ms): ${Math.abs(now - reminderTime)}`,
        )

        // Calculate time difference in milliseconds
        const diffMs = Math.abs(reminderTime - now)

        // Check if we're within 1 minute of the reminder time
        if (diffMs < 60000 && now <= deadlineTime) {
          console.log("SHOWING BEFORE REMINDER for", task.title)
          showReminderNotification(task.title, `Due in ${minutesBefore} minutes`)
        }

        // Also check if we're exactly at the deadline
        const deadlineTimeDiff = Math.abs(now - deadlineTime)
        if (deadlineTimeDiff < 60000) {
          console.log("SHOWING DEADLINE REMINDER for", task.title)
          showReminderNotification(task.title, "Task is due now!")
        }
      }
    })
  })
}

// Update the showReminderNotification function to prevent duplicate notifications
// Add a tracking mechanism for recently shown notifications
const recentNotifications = new Map()

function showReminderNotification(taskTitle, reminderText) {
  // Create a unique key for this notification
  const notificationKey = `${taskTitle}-${reminderText}`

  // Check if we've shown this notification in the last 4 minutes
  const now = Date.now()
  if (recentNotifications.has(notificationKey)) {
    const lastShown = recentNotifications.get(notificationKey)
    if (now - lastShown < 240000) {
      // 4 minutes in milliseconds
      console.log("Skipping duplicate notification:", notificationKey)
      return
    }
  }

  // Record this notification
  recentNotifications.set(notificationKey, now)

  // Clean up old notifications (older than 5 minutes)
  recentNotifications.forEach((timestamp, key) => {
    if (now - timestamp > 300000) {
      // 5 minutes in milliseconds
      recentNotifications.delete(key)
    }
  })

  // Create a more prominent reminder notification
  const notification = document.createElement("div")
  notification.className = "toast reminder-toast"

  // Add icon and content
  notification.innerHTML = `
    <div class="reminder-toast-icon">
      <i class="fas fa-bell"></i>
    </div>
    <div class="reminder-toast-content">
      <div class="reminder-toast-title">Reminder: ${taskTitle}</div>
      <div class="reminder-toast-text">${reminderText}</div>
    </div>
    <button class="toast-close">×</button>
  `

  document.body.appendChild(notification)

  // Add event listener to close button
  notification.querySelector(".toast-close").addEventListener("click", () => {
    notification.remove()
  })

  // Auto remove after 10 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.classList.add("fade-out")
      setTimeout(() => notification.remove(), 500)
    }
  }, 10000)

  // Try to play a notification sound
  try {
    const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU")
    audio.play().catch((e) => console.log("Audio play failed:", e))
  } catch (e) {
    console.log("Notification sound could not be played:", e)
  }

  console.log("Reminder notification shown for:", taskTitle, reminderText)
}

function editTask(taskId) {
  const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || []

  const task = tasks.find((t) => t.id === taskId)
  if (task) {
    editingTaskId = taskId // Set editing mode with the task id
    const modal = document.getElementById("task-modal")
    modal.style.display = "block"

    // Update modal title
    document.getElementById("modal-title").textContent = "Edit Task"

    // Fill form with task data
    document.getElementById("task-title").value = task.title
    document.getElementById("task-description").value = task.description || ""
    document.getElementById("task-deadline").value = task.deadline
    document.getElementById("task-date").value = task.date || new Date().toISOString().split("T")[0]

    // Set date text
    const date = new Date(task.date || new Date())
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let dateText = "Today"
    if (date.toDateString() === today.toDateString()) {
      dateText = "Today"
    } else if (date.getTime() === today.getTime() + 86400000) {
      dateText = "Tomorrow"
    } else {
      dateText = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    document.getElementById("selected-date").textContent = dateText

    // Set priority
    updateSelectedPriority(task.priority || "4")

    // Load subtasks
    const subtasksContainer = document.getElementById("subtasks-container")
    subtasksContainer.innerHTML = ""

    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach((subtask) => {
        const subtaskItem = document.createElement("div")
        subtaskItem.className = "subtask-item"

        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.className = "subtask-checkbox"
        checkbox.checked = subtask.completed

        const input = document.createElement("input")
        input.type = "text"
        input.className = "subtask-content"
        input.value = subtask.text

        const deleteBtn = document.createElement("button")
        deleteBtn.className = "subtask-delete-btn"
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'
        deleteBtn.addEventListener("click", () => {
          subtaskItem.remove()
        })

        subtaskItem.appendChild(checkbox)
        subtaskItem.appendChild(input)
        subtaskItem.appendChild(deleteBtn)

        subtasksContainer.appendChild(subtaskItem)
      })
    }

    // Load comments
    const commentsContainer = document.getElementById("comments-container")
    commentsContainer.innerHTML = ""

    if (task.comments && task.comments.length > 0) {
      task.comments.forEach((comment) => {
        const commentItem = document.createElement("div")
        commentItem.className = "comment-item"

        const commentHeader = document.createElement("div")
        commentHeader.className = "comment-header"

        const commentAuthor = document.createElement("div")
        commentAuthor.className = "comment-author"
        commentAuthor.textContent = comment.author

        const commentDate = document.createElement("div")
        commentDate.className = "comment-date"
        commentDate.textContent = comment.date

        commentHeader.appendChild(commentAuthor)
        commentHeader.appendChild(commentDate)

        const commentTextElement = document.createElement("div")
        commentTextElement.className = "comment-text"
        commentTextElement.textContent = comment.text

        commentItem.appendChild(commentHeader)
        commentItem.appendChild(commentTextElement)

        commentsContainer.appendChild(commentItem)
      })
    }

    // Load reminders
    const remindersContainer = document.getElementById("reminders-container")
    remindersContainer.innerHTML = ""

    if (task.reminders && task.reminders.length > 0) {
      task.reminders.forEach((reminder) => {
        const reminderItem = document.createElement("div")
        reminderItem.className = "reminder-item"

        const reminderInfo = document.createElement("div")
        reminderInfo.className = "reminder-info"

        const icon = document.createElement("i")
        icon.className = "fas fa-bell"

        const reminderText = document.createElement("span")
        reminderText.textContent = reminder.text

        reminderInfo.appendChild(icon)
        reminderInfo.appendChild(reminderText)

        const deleteBtn = document.createElement("i")
        deleteBtn.className = "fas fa-times reminder-delete"
        deleteBtn.addEventListener("click", () => {
          reminderItem.remove()
        })

        reminderItem.appendChild(reminderInfo)
        reminderItem.appendChild(deleteBtn)

        // Store reminder data
        reminderItem.dataset.type = reminder.type
        if (reminder.type === "date") {
          reminderItem.dataset.date = reminder.date
          reminderItem.dataset.time = reminder.time
        } else {
          reminderItem.dataset.value = reminder.value
        }

        remindersContainer.appendChild(reminderItem)
      })
    }

    document.getElementById("task-title").focus()
  }
}

function deleteTask(taskId, reload = true) {
  if (!confirm("Are you sure you want to delete this task?")) return

  const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || []

  // Remove only the task that matches the id
  const filteredTasks = tasks.filter((t) => t.id !== taskId)
  localStorage.setItem(`taskick_tasks_${currentUser.id}`, JSON.stringify(filteredTasks))

  showToast("Task deleted!")

  // Dispatch custom event to notify progress page of updates
  window.dispatchEvent(new Event("taskUpdated"))

  if (reload) {
    loadTasks()
  }
}

function toggleTaskCompletion(taskId) {
  const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || []

  const taskIndex = tasks.findIndex((t) => t.id === taskId)
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = !tasks[taskIndex].completed
    if (tasks[taskIndex].completed) {
      // Record the completion time so the graph uses the correct date
      tasks[taskIndex].completedAt = new Date().toISOString()
      showToast("Task completed!")
    } else {
      // Clear the completedAt value when unchecking
      tasks[taskIndex].completedAt = null
      showToast("Task marked as incomplete!")
    }
    localStorage.setItem(`taskick_tasks_${currentUser.id}`, JSON.stringify(tasks))

    // Dispatch custom event to notify progress page of updates
    window.dispatchEvent(new Event("taskUpdated"))

    // Reload tasks after toggling completion
    setTimeout(() => {
      loadTasks()
    }, 500)
  }
}

function updateTaskDeadline(taskId, newDeadline) {
  const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || []

  const taskIndex = tasks.findIndex((t) => t.id === taskId)
  if (taskIndex !== -1) {
    tasks[taskIndex].deadline = newDeadline
    localStorage.setItem(`taskick_tasks_${currentUser.id}`, JSON.stringify(tasks))
    loadTasks()
    showToast("Deadline updated!")
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
}

// Function to manually trigger reminders for testing
function triggerAllReminders() {
  const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  if (!currentUser) return

  const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || []

  tasks.forEach((task) => {
    if (!task.completed && task.reminders && task.reminders.length > 0) {
      task.reminders.forEach((reminder) => {
        console.log("Manually triggering reminder for:", task.title)
        showReminderNotification(task.title, reminder.text || "Reminder!")
      })
    }
  })

}

// Call this function to immediately trigger all reminders
// Uncomment the next line to trigger all reminders immediately
// triggerAllReminders()


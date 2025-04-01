// Handle calendar functionality
document.addEventListener("DOMContentLoaded", () => {
  const currentDate = new Date()
  const selectedDate = new Date()

  renderCalendar(currentDate)

  // Previous month button
  const prevMonthBtn = document.getElementById("prev-month")
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1)
      renderCalendar(currentDate)
    })
  }

  // Next month button
  const nextMonthBtn = document.getElementById("next-month")
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1)
      renderCalendar(currentDate)
    })
  }
})

function renderCalendar(date) {
  const calendarDays = document.getElementById("calendar-days")
  if (!calendarDays) return

  const currentMonth = date.getMonth()
  const currentYear = date.getFullYear()

  // Update month and year display
  document.getElementById("current-month").textContent =
    `${date.toLocaleString("default", { month: "long" })} ${currentYear}`

  // Clear calendar
  calendarDays.innerHTML = ""

  // Get first day of month and last day of month
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)

  // Get day of week for first day (0 = Sunday, 6 = Saturday)
  const firstDayIndex = firstDay.getDay()

  // Get total days in month
  const totalDays = lastDay.getDate()

  // Get tasks for the month
  const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser?.id}`)) || []

  // Add days from previous month
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate()
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayElement = createDayElement(prevMonthLastDay - i, true)
    calendarDays.appendChild(dayElement)
  }

  // Add days for current month
  for (let day = 1; day <= totalDays; day++) {
    const currentDateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const dayTasks = tasks.filter((task) => task.deadline === currentDateString)

    const dayElement = createDayElement(day, false, dayTasks)

    // Check if it's today
    const today = new Date()
    if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
      dayElement.classList.add("today")
    }

    // Add click event to show tasks for the day
    dayElement.addEventListener("click", function () {
      // Remove selected class from all days
      document.querySelectorAll(".calendar-day").forEach((day) => day.classList.remove("selected"))

      // Add selected class to clicked day
      this.classList.add("selected")

      // Show tasks for the day
      showDayTasks(currentDateString, dayTasks)
    })

    calendarDays.appendChild(dayElement)
  }

  // Add days for next month
  const totalCells = 42 // 6 rows x 7 days
  const remainingCells = totalCells - (firstDayIndex + totalDays)

  for (let i = 1; i <= remainingCells; i++) {
    const dayElement = createDayElement(i, true)
    calendarDays.appendChild(dayElement)
  }

  // Show tasks for today by default
  const today = new Date()
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  const todayTasks = tasks.filter((task) => task.deadline === todayString)
  showDayTasks(todayString, todayTasks)
}

function createDayElement(day, isOtherMonth, tasks = []) {
  const dayElement = document.createElement("div")
  dayElement.className = "calendar-day"

  if (isOtherMonth) {
    dayElement.classList.add("other-month")
  }

  const dayNumber = document.createElement("div")
  dayNumber.className = "calendar-day-number"
  dayNumber.textContent = day

  dayElement.appendChild(dayNumber)

  // Add task indicators
  if (tasks && tasks.length > 0) {
    const taskIndicators = document.createElement("div")
    taskIndicators.className = "task-indicators"

    // Limit to showing max 3 tasks with indicators
    const maxTasksToShow = Math.min(tasks.length, 3)

    for (let i = 0; i < maxTasksToShow; i++) {
      const task = tasks[i]
      const indicator = document.createElement("div")
      indicator.className = "day-task-indicator"

      // Add different colors based on completion status
      if (task.completed) {
        indicator.classList.add("completed")
      }

      // Add tooltip with task title
      indicator.title = task.title

      taskIndicators.appendChild(indicator)
    }

    // If there are more tasks than we're showing
    if (tasks.length > maxTasksToShow) {
      const moreIndicator = document.createElement("div")
      moreIndicator.className = "more-tasks"
      moreIndicator.textContent = `+${tasks.length - maxTasksToShow}`
      taskIndicators.appendChild(moreIndicator)
    }

    dayElement.appendChild(taskIndicators)
  }

  return dayElement
}

function showDayTasks(dateString, tasks) {
  const dayTaskList = document.getElementById("day-task-list")
  if (!dayTaskList) return

  // Format date for display
  const date = new Date(dateString)
  document.getElementById("selected-date").textContent =
    `Tasks for ${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`

  // Clear task list
  dayTaskList.innerHTML = ""

  // Add tasks to the list
  if (tasks && tasks.length > 0) {
    tasks.forEach((task) => {
      const taskItem = document.createElement("div")
      taskItem.className = "task-item"

      const checkbox = document.createElement("input")
      checkbox.type = "checkbox"
      checkbox.className = "task-checkbox"
      checkbox.checked = task.completed
      checkbox.addEventListener("change", () => {
        toggleTaskCompletion(task.id)
        // Refresh calendar after toggling
        setTimeout(() => {
          renderCalendar(new Date(dateString))
        }, 500)
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

      content.appendChild(title)

      if (task.description) {
        const description = document.createElement("div")
        description.className = "task-description"
        description.textContent = task.description
        content.appendChild(description)
      }

      taskItem.appendChild(checkbox)
      taskItem.appendChild(content)

      dayTaskList.appendChild(taskItem)
    })
  } else {
    dayTaskList.innerHTML = '<div class="empty-state">No tasks for this day</div>'
  }
}

function toggleTaskCompletion(taskId) {
  const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || []

  const taskIndex = tasks.findIndex((t) => t.id === taskId)
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = !tasks[taskIndex].completed

    // Add completion timestamp if completed
    if (tasks[taskIndex].completed) {
      tasks[taskIndex].completedAt = new Date().toISOString()
    } else {
      delete tasks[taskIndex].completedAt
    }

    localStorage.setItem(`taskick_tasks_${currentUser.id}`, JSON.stringify(tasks))
  }
}


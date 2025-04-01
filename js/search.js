// Handle search page functionality
document.addEventListener("DOMContentLoaded", () => {
    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search)
    const searchQuery = urlParams.get("q") || ""
  
    // Display search query
    document.getElementById("search-query-display").textContent = searchQuery
  
    // Set search input value to the query
    const headerSearchInput = document.getElementById("header-search-input")
    if (headerSearchInput) {
      headerSearchInput.value = searchQuery
    }
  
    // Perform search
    if (searchQuery) {
      performSearch(searchQuery)
    } else {
      showNoResults("Please enter a search term")
    }
  
    // Add event listeners for search filters
    const searchFilter = document.getElementById("search-filter")
    const searchSort = document.getElementById("search-sort")
  
    if (searchFilter) {
      searchFilter.addEventListener("change", () => {
        performSearch(searchQuery)
      })
    }
  
    if (searchSort) {
      searchSort.addEventListener("change", () => {
        performSearch(searchQuery)
      })
    }
  
    // Add event listener for header search
    const headerSearchButton = document.getElementById("header-search-button")
    if (headerSearchButton && headerSearchInput) {
      headerSearchButton.addEventListener("click", (e) => {
        e.preventDefault()
        const newQuery = headerSearchInput.value.trim()
        if (newQuery) {
          window.location.href = `search-page.html?q=${encodeURIComponent(newQuery)}`
        }
      })
  
      headerSearchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          const newQuery = headerSearchInput.value.trim()
          if (newQuery) {
            window.location.href = `search-page.html?q=${encodeURIComponent(newQuery)}`
          }
        }
      })
    }
  })
  
  function performSearch(query) {
    const searchResultsContainer = document.getElementById("search-results")
    const filterValue = document.getElementById("search-filter").value
    const sortValue = document.getElementById("search-sort").value
  
    // Show loading spinner
    searchResultsContainer.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Searching...</span>
      </div>
    `
  
    // Get user tasks
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
    if (!currentUser) {
      showNoResults("You need to be logged in to search tasks")
      return
    }
  
    const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || []
  
    // Filter tasks based on search query and filter option
    let filteredTasks = tasks.filter((task) => {
      const matchesQuery =
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
  
      if (!matchesQuery) return false
  
      // Apply filter
      if (filterValue === "completed") {
        return task.completed
      } else if (filterValue === "incomplete") {
        return !task.completed
      }
  
      return true
    })
  
    // Sort tasks
    filteredTasks = sortTasks(filteredTasks, sortValue)
  
    // Simulate a short delay for the loading spinner (for better UX)
    setTimeout(() => {
      if (filteredTasks.length > 0) {
        displaySearchResults(filteredTasks, query)
      } else {
        showNoResults("No tasks found matching your search")
      }
    }, 500)
  }
  
  function sortTasks(tasks, sortOption) {
    switch (sortOption) {
      case "date-asc":
        return tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      case "date-desc":
        return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      case "priority":
        return tasks.sort((a, b) => {
          const priorityA = Number.parseInt(a.priority || "4")
          const priorityB = Number.parseInt(b.priority || "4")
          return priorityA - priorityB
        })
      default: // relevance - no additional sorting needed
        return tasks
    }
  }
  
  function displaySearchResults(tasks, query) {
    const searchResultsContainer = document.getElementById("search-results")
    searchResultsContainer.innerHTML = ""
  
    tasks.forEach((task) => {
      const resultItem = document.createElement("div")
      resultItem.className = `search-result-item priority-${task.priority || "4"}`
      resultItem.dataset.id = task.id
  
      const checkbox = document.createElement("input")
      checkbox.type = "checkbox"
      checkbox.className = "search-result-checkbox"
      checkbox.checked = task.completed
      checkbox.addEventListener("change", () => {
        toggleTaskCompletion(task.id)
        // Update UI
        const titleElement = resultItem.querySelector(".search-result-title")
        if (checkbox.checked) {
          titleElement.classList.add("completed")
        } else {
          titleElement.classList.remove("completed")
        }
      })
  
      const content = document.createElement("div")
      content.className = "search-result-content"
  
      // Highlight the search term in the title
      const titleElement = document.createElement("div")
      titleElement.className = `search-result-title ${task.completed ? "completed" : ""}`
      titleElement.innerHTML = highlightText(task.title, query)
  
      const details = document.createElement("div")
      details.className = "search-result-details"
  
      // Add deadline
      if (task.deadline) {
        const deadlineDetail = document.createElement("div")
        deadlineDetail.className = "search-result-detail"
        deadlineDetail.innerHTML = `
          <i class="fas fa-calendar-alt"></i>
          <span>${formatDate(task.deadline)}</span>
        `
        details.appendChild(deadlineDetail)
      }
  
      // Add priority
      const priorityDetail = document.createElement("div")
      priorityDetail.className = "search-result-detail"
      priorityDetail.innerHTML = `
        <i class="fas fa-flag priority-flag p${task.priority || "4"}"></i>
        <span>Priority ${task.priority || "4"}</span>
      `
      details.appendChild(priorityDetail)
  
      // Add subtasks count if any
      if (task.subtasks && task.subtasks.length > 0) {
        const subtasksDetail = document.createElement("div")
        subtasksDetail.className = "search-result-detail"
        const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length
        subtasksDetail.innerHTML = `
          <i class="fas fa-tasks"></i>
          <span>${completedSubtasks}/${task.subtasks.length} subtasks</span>
        `
        details.appendChild(subtasksDetail)
      }
  
      content.appendChild(titleElement)
  
      // Add description preview if it exists and matches the query
      if (task.description && task.description.toLowerCase().includes(query.toLowerCase())) {
        const descriptionPreview = document.createElement("div")
        descriptionPreview.className = "search-result-description"
        descriptionPreview.innerHTML = highlightText(truncateText(task.description, 100), query)
        content.appendChild(descriptionPreview)
      }
  
      content.appendChild(details)
  
      resultItem.appendChild(checkbox)
      resultItem.appendChild(content)
  
      // Make the result item clickable to edit the task
      resultItem.addEventListener("click", (e) => {
        if (e.target !== checkbox) {
          editTask(task.id)
        }
      })
  
      searchResultsContainer.appendChild(resultItem)
    })
  }
  
  function showNoResults(message) {
    const searchResultsContainer = document.getElementById("search-results")
    searchResultsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>${message}</p>
      </div>
    `
  }
  
  function highlightText(text, query) {
    if (!query || query.trim() === "") return text
  
    const regex = new RegExp(`(${escapeRegExp(query)})`, "gi")
    return text.replace(regex, '<span class="search-highlight">$1</span>')
  }
  
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }
  
  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  
  function toggleTaskCompletion(taskId) {
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
    const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || []
  
    const taskIndex = tasks.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      tasks[taskIndex].completed = !tasks[taskIndex].completed
      if (tasks[taskIndex].completed) {
        tasks[taskIndex].completedAt = new Date().toISOString()
      } else {
        tasks[taskIndex].completedAt = null
      }
      localStorage.setItem(`taskick_tasks_${currentUser.id}`, JSON.stringify(tasks))
  
      // Dispatch custom event to notify other pages of updates
      window.dispatchEvent(new Event("taskUpdated"))
    }
  }
  
  function editTask(taskId) {
    // Store task ID in session storage
    sessionStorage.setItem("editTaskId", taskId)
  
    // Redirect to dashboard
    window.location.href = "dashboard.html"
  }
  
  
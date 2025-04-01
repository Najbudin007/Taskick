// Handle settings page functionality
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  
    if (currentUser) {
      // Load user settings
      loadUserSettings(currentUser)
    }
  
    // Save settings button
    const saveSettingsBtn = document.getElementById("save-settings")
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener("click", saveSettings)
    }
  
    // Export data button
    const exportDataBtn = document.getElementById("export-data")
    if (exportDataBtn) {
      exportDataBtn.addEventListener("click", exportUserData)
    }
  
    // Import data button
    const importDataBtn = document.getElementById("import-data")
    if (importDataBtn) {
      importDataBtn.addEventListener("click", () => {
        // Create a file input element
        const fileInput = document.createElement("input")
        fileInput.type = "file"
        fileInput.accept = ".json"
        fileInput.style.display = "none"
        document.body.appendChild(fileInput)
  
        // Trigger click on the file input
        fileInput.click()
  
        // Handle file selection
        fileInput.addEventListener("change", (event) => {
          const file = event.target.files[0]
          if (file) {
            importUserData(file)
          }
          // Remove the file input
          document.body.removeChild(fileInput)
        })
      })
    }
  
    // Clear data button
    const clearDataBtn = document.getElementById("clear-data")
    if (clearDataBtn) {
      clearDataBtn.addEventListener("click", showClearDataConfirmation)
    }
  
    // Cancel clear button
    const cancelClearBtn = document.getElementById("cancel-clear")
    if (cancelClearBtn) {
      cancelClearBtn.addEventListener("click", hideClearDataConfirmation)
    }
  
    // Confirm clear button
    const confirmClearBtn = document.getElementById("confirm-clear")
    if (confirmClearBtn) {
      confirmClearBtn.addEventListener("click", clearAllTasks)
    }
  
    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
      const modal = document.getElementById("clear-data-modal")
      if (event.target === modal) {
        hideClearDataConfirmation()
      }
    })
  })
  
  function loadUserSettings(user) {
    // Set language
    const languageSelect = document.getElementById("language")
    if (languageSelect && user.settings && user.settings.language) {
      languageSelect.value = user.settings.language
    }
  
    // Set date format
    const dateFormatSelect = document.getElementById("date-format")
    if (dateFormatSelect && user.settings && user.settings.dateFormat) {
      dateFormatSelect.value = user.settings.dateFormat
    }
  
    // Set time format
    const timeFormatSelect = document.getElementById("time-format")
    if (timeFormatSelect && user.settings && user.settings.timeFormat) {
      timeFormatSelect.value = user.settings.timeFormat
    }
  
    // Set notification settings
    if (user.settings && user.settings.notifications) {
      const emailNotifications = document.getElementById("email-notifications")
      if (emailNotifications) {
        emailNotifications.checked = user.settings.notifications.includes("email")
      }
  
      const pushNotifications = document.getElementById("push-notifications")
      if (pushNotifications) {
        pushNotifications.checked = user.settings.notifications.includes("push")
      }
  
      const soundAlerts = document.getElementById("sound-alerts")
      if (soundAlerts) {
        soundAlerts.checked = user.settings.notifications.includes("sound")
      }
    }
  
    // Set default reminder time
    const notificationTime = document.getElementById("notification-time")
    if (notificationTime && user.settings && user.settings.defaultReminderTime) {
      notificationTime.value = user.settings.defaultReminderTime
    }
  
    // Set accessibility settings
    if (user.settings && user.settings.accessibility) {
      const fontSize = document.getElementById("font-size")
      if (fontSize) {
        fontSize.value = user.settings.accessibility.fontSize || "medium"
      }
  
      const highContrast = document.getElementById("high-contrast")
      if (highContrast) {
        highContrast.checked = user.settings.accessibility.highContrast || false
      }
  
      const reduceAnimations = document.getElementById("reduce-animations")
      if (reduceAnimations) {
        reduceAnimations.checked = user.settings.accessibility.reduceAnimations || false
      }
    }
  
    // Set privacy settings
    if (user.settings && user.settings.privacy) {
      const usageData = document.getElementById("usage-data")
      if (usageData) {
        usageData.checked = user.settings.privacy.usageData || true
      }
  
      const publicCompletion = document.getElementById("public-completion")
      if (publicCompletion) {
        publicCompletion.checked = user.settings.privacy.publicCompletion || true
      }
    }
  }
  
  function saveSettings() {
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  
    if (currentUser) {
      // Get language settings
      const language = document.getElementById("language").value
      const dateFormat = document.getElementById("date-format").value
      const timeFormat = document.getElementById("time-format").value
  
      // Get notification settings
      const emailNotifications = document.getElementById("email-notifications").checked
      const pushNotifications = document.getElementById("push-notifications").checked
      const soundAlerts = document.getElementById("sound-alerts").checked
      const defaultReminderTime = document.getElementById("notification-time").value
  
      // Get accessibility settings
      const fontSize = document.getElementById("font-size").value
      const highContrast = document.getElementById("high-contrast").checked
      const reduceAnimations = document.getElementById("reduce-animations").checked
  
      // Get privacy settings
      const usageData = document.getElementById("usage-data").checked
      const publicCompletion = document.getElementById("public-completion").checked
  
      // Create notifications array
      const notifications = []
      if (emailNotifications) notifications.push("email")
      if (pushNotifications) notifications.push("push")
      if (soundAlerts) notifications.push("sound")
  
      // Update user settings
      currentUser.settings = {
        language,
        dateFormat,
        timeFormat,
        notifications,
        defaultReminderTime,
        accessibility: {
          fontSize,
          highContrast,
          reduceAnimations,
        },
        privacy: {
          usageData,
          publicCompletion,
        },
      }
  
      // Save to local storage
      localStorage.setItem("taskick_current_user", JSON.stringify(currentUser))
  
      // Update users array
      const users = JSON.parse(localStorage.getItem("taskick_users")) || []
      const userIndex = users.findIndex((u) => u.id === currentUser.id)
      if (userIndex !== -1) {
        users[userIndex] = currentUser
        localStorage.setItem("taskick_users", JSON.stringify(users))
      }
  
      // Apply settings immediately
      applySettings(currentUser.settings)
  
      // Show success message
      showToast("Settings saved successfully!")
    }
  }
  
  function applySettings(settings) {
    // Apply font size
    if (settings.accessibility && settings.accessibility.fontSize) {
      document.documentElement.style.fontSize =
        settings.accessibility.fontSize === "small"
          ? "14px"
          : settings.accessibility.fontSize === "large"
            ? "18px"
            : "16px"
    }
  
    // Apply high contrast
    if (settings.accessibility && settings.accessibility.highContrast) {
      document.body.classList.add("high-contrast")
    } else {
      document.body.classList.remove("high-contrast")
    }
  
    // Apply reduced animations
    if (settings.accessibility && settings.accessibility.reduceAnimations) {
      document.body.classList.add("reduce-animations")
    } else {
      document.body.classList.remove("reduce-animations")
    }
  }
  
  function exportUserData() {
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  
    if (currentUser) {
      // Get user tasks
      const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || []
  
      // Create export data object
      const exportData = {
        user: {
          name: currentUser.name,
          email: currentUser.email,
          settings: currentUser.settings,
        },
        tasks: tasks,
      }
  
      // Convert to JSON string
      const jsonData = JSON.stringify(exportData, null, 2)
  
      // Create download link
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `taskick_data_${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
  
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
  
      showToast("Data exported successfully!")
    }
  }
  
  function importUserData(file) {
    const reader = new FileReader()
  
    reader.onload = (event) => {
      try {
        const importData = JSON.parse(event.target.result)
        const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  
        if (currentUser && importData.tasks) {
          // Get existing tasks
          const existingTasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || []
  
          // Merge imported tasks with existing tasks
          // Use a Map to avoid duplicates based on task ID
          const tasksMap = new Map()
  
          // Add existing tasks to the map
          existingTasks.forEach((task) => {
            tasksMap.set(task.id, task)
          })
  
          // Add or update with imported tasks
          importData.tasks.forEach((task) => {
            tasksMap.set(task.id, task)
          })
  
          // Convert map back to array
          const mergedTasks = Array.from(tasksMap.values())
  
          // Save merged tasks
          localStorage.setItem(`taskick_tasks_${currentUser.id}`, JSON.stringify(mergedTasks))
  
          // Import settings if available
          if (importData.user && importData.user.settings) {
            currentUser.settings = {
              ...currentUser.settings,
              ...importData.user.settings,
            }
  
            // Save updated user
            localStorage.setItem("taskick_current_user", JSON.stringify(currentUser))
  
            // Update users array
            const users = JSON.parse(localStorage.getItem("taskick_users")) || []
            const userIndex = users.findIndex((u) => u.id === currentUser.id)
            if (userIndex !== -1) {
              users[userIndex] = currentUser
              localStorage.setItem("taskick_users", JSON.stringify(users))
            }
  
            // Apply imported settings
            applySettings(currentUser.settings)
          }
  
          showToast("Data imported successfully!")
        } else {
          showToast("Invalid import data format", 5000)
        }
      } catch (error) {
        console.error("Import error:", error)
        showToast("Error importing data: " + error.message, 5000)
      }
    }
  
    reader.readAsText(file)
  }
  
  function showClearDataConfirmation() {
    const modal = document.getElementById("clear-data-modal")
    modal.style.display = "block"
  }
  
  function hideClearDataConfirmation() {
    const modal = document.getElementById("clear-data-modal")
    modal.style.display = "none"
  }
  
  function clearAllTasks() {
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  
    if (currentUser) {
      // Clear tasks
      localStorage.setItem(`taskick_tasks_${currentUser.id}`, JSON.stringify([]))
  
      // Hide confirmation modal
      hideClearDataConfirmation()
  
      // Show success message
      showToast("All tasks have been cleared!")
    }
  }
  
  // Toast notification function
  function showToast(message, duration = 3000) {
    // Check if there's already a toast
    let toast = document.querySelector(".toast")
  
    // If not, create a new one
    if (!toast) {
      toast = document.createElement("div")
      toast.className = "toast"
      document.body.appendChild(toast)
    }
  
    // Update message
    toast.textContent = message
  
    // Show the toast
    toast.style.display = "block"
  
    // Hide after duration
    setTimeout(() => {
      toast.classList.add("fade-out")
      setTimeout(() => {
        toast.remove()
      }, 500)
    }, duration)
  }
  
  
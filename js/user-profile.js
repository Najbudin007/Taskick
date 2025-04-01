// Handle user profile page functionality
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  
    if (currentUser) {
      // Update profile header
      document.getElementById("profile-name").textContent = currentUser.name || "User Name"
      document.getElementById("profile-email").textContent = currentUser.email || "user@example.com"
  
      // Fill form with user data
      document.getElementById("user-fullname").value = currentUser.name || ""
      document.getElementById("user-email").value = currentUser.email || ""
      document.getElementById("user-password").value = currentUser.password || ""
  
      // Load user statistics
      loadUserStatistics(currentUser.id)
    }
  
    // Save profile button
    const saveProfileBtn = document.getElementById("save-profile")
    if (saveProfileBtn) {
      saveProfileBtn.addEventListener("click", saveProfile)
    }
  
    // Delete account button
    const deleteAccountBtn = document.getElementById("delete-account")
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener("click", showDeleteConfirmation)
    }
  
    // Cancel delete button
    const cancelDeleteBtn = document.getElementById("cancel-delete")
    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener("click", hideDeleteConfirmation)
    }
  
    // Confirm delete button
    const confirmDeleteBtn = document.getElementById("confirm-delete")
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", deleteAccount)
    }
  
    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
      const modal = document.getElementById("delete-confirmation-modal")
      if (event.target === modal) {
        hideDeleteConfirmation()
      }
    })
  })
  
  function loadUserStatistics(userId) {
    // Get tasks
    const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${userId}`)) || []
  
    // Calculate statistics
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.completed).length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
    // Calculate account age in days
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
    const creationDate = new Date(currentUser.createdAt || Date.now())
    const today = new Date()
    const diffTime = Math.abs(today - creationDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
    // Update statistics display
    document.getElementById("total-tasks").textContent = totalTasks
    document.getElementById("completed-tasks").textContent = completedTasks
    document.getElementById("completion-rate").textContent = `${completionRate}%`
    document.getElementById("account-age").textContent = diffDays
  }
  
  function saveProfile() {
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  
    if (currentUser) {
      // Get form values
      const name = document.getElementById("user-fullname").value
      const email = document.getElementById("user-email").value
      const password = document.getElementById("user-password").value
  
      // Validate required fields
      if (!name || !email || !password) {
        alert("Please fill in all required fields")
        return
      }
  
      // Check if email is already used by another user
      const users = JSON.parse(localStorage.getItem("taskick_users")) || []
      const existingUser = users.find((u) => u.email === email && u.id !== currentUser.id)
      if (existingUser) {
        alert("Email is already in use by another account")
        return
      }
  
      // Update user data
      currentUser.name = name
      currentUser.email = email
      currentUser.password = password
  
      // Save to local storage
      localStorage.setItem("taskick_current_user", JSON.stringify(currentUser))
  
      // Update users array
      const userIndex = users.findIndex((u) => u.id === currentUser.id)
      if (userIndex !== -1) {
        users[userIndex] = currentUser
        localStorage.setItem("taskick_users", JSON.stringify(users))
      }
  
      // Update profile header
      document.getElementById("profile-name").textContent = name
      document.getElementById("profile-email").textContent = email
  
      // Update sidebar username
      const sidebarUsername = document.getElementById("user-name")
      if (sidebarUsername) {
        sidebarUsername.textContent = name
      }
  
      // Show success message
      showToast("Profile updated successfully!")
    }
  }
  
  function showDeleteConfirmation() {
    const modal = document.getElementById("delete-confirmation-modal")
    modal.style.display = "block"
  }
  
  function hideDeleteConfirmation() {
    const modal = document.getElementById("delete-confirmation-modal")
    modal.style.display = "none"
  }
  
  function deleteAccount() {
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  
    if (currentUser) {
      // Remove user from users array
      const users = JSON.parse(localStorage.getItem("taskick_users")) || []
      const filteredUsers = users.filter((u) => u.id !== currentUser.id)
      localStorage.setItem("taskick_users", JSON.stringify(filteredUsers))
  
      // Remove user tasks
      localStorage.removeItem(`taskick_tasks_${currentUser.id}`)
  
      // Remove custom themes
      localStorage.removeItem(`taskick_themes_${currentUser.id}`)
  
      // Remove current user
      localStorage.removeItem("taskick_current_user")
  
      // Redirect to login page
      window.location.href = "index.html"
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
  
  
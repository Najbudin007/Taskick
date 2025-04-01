// Handle customization page functionality
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  
    // Set initial values
    if (currentUser) {
      // Auto dark mode toggle
      const autoDarkMode = document.getElementById("auto-dark-mode")
      if (autoDarkMode) {
        autoDarkMode.checked = currentUser.autoDarkMode || false
      }
  
      // Active theme
      const themeCards = document.querySelectorAll(".theme-card")
      themeCards.forEach((card) => {
        if (card.dataset.theme === currentUser.theme) {
          card.classList.add("active")
        }
  
        // Add click event
        card.addEventListener("click", function () {
          if (this.classList.contains("add-theme")) {
            openThemeModal()
            return
          }
  
          // Remove active class from all cards
          themeCards.forEach((c) => c.classList.remove("active"))
  
          // Add active class to clicked card
          this.classList.add("active")
  
          // Apply theme
          applyTheme(this.dataset.theme)
        })
      })
  
      // Humor level
      const humorSlider = document.getElementById("humor-slider")
      if (humorSlider) {
        humorSlider.value = currentUser.humorLevel || 50
      }
    }
  
    // Add theme button
    const addThemeBtn = document.getElementById("add-theme")
    if (addThemeBtn) {
      addThemeBtn.addEventListener("click", openThemeModal)
    }
  
    // Save theme button
    const saveThemeBtn = document.getElementById("save-theme-btn")
    if (saveThemeBtn) {
      saveThemeBtn.addEventListener("click", saveCustomTheme)
    }
  
    // Update button
    const updateBtn = document.getElementById("update-customization")
    if (updateBtn) {
      updateBtn.addEventListener("click", saveCustomizationSettings)
    }
  
    // Close modal
    const closeBtn = document.querySelector(".close")
    if (closeBtn) {
      closeBtn.addEventListener("click", closeThemeModal)
    }
  
    // Color picker
    const colorPicker = document.getElementById("color-picker")
    const themeColor = document.getElementById("theme-color")
  
    if (colorPicker && themeColor) {
      colorPicker.addEventListener("input", function () {
        themeColor.value = this.value
      })
  
      themeColor.addEventListener("input", function () {
        colorPicker.value = this.value
      })
    }
  
    // Load custom themes
    loadCustomThemes()
  })
  
  function applyTheme(theme) {
    // Remove all theme classes
    document.body.classList.remove("light", "dark", "vibrant", "tech")
  
    // Add selected theme class
    document.body.classList.add(theme)
  
    // Save theme preference
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
    if (currentUser) {
      currentUser.theme = theme
      localStorage.setItem("taskick_current_user", JSON.stringify(currentUser))
    }
  }
  
  function openThemeModal() {
    const modal = document.getElementById("theme-modal")
    if (modal) {
      modal.style.display = "block"
  
      // Clear form
      document.getElementById("theme-name").value = ""
      document.getElementById("theme-color").value = "#4CAF50"
      document.getElementById("color-picker").value = "#4CAF50"
    }
  }
  
  function closeThemeModal() {
    const modal = document.getElementById("theme-modal")
    if (modal) {
      modal.style.display = "none"
    }
  }
  
  function saveCustomTheme() {
    const themeName = document.getElementById("theme-name").value
    const themeColor = document.getElementById("theme-color").value
  
    if (!themeName || !themeColor) {
      alert("Please enter a theme name and color")
      return
    }
  
    // Validate hex color
    if (!/^#[0-9A-F]{6}$/i.test(themeColor)) {
      alert("Please enter a valid hex color (e.g., #FF5733)")
      return
    }
  
    // Save custom theme
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
    if (currentUser) {
      const customThemes = JSON.parse(localStorage.getItem(`taskick_themes_${currentUser.id}`)) || []
  
      // Check if theme name already exists
      if (customThemes.some((theme) => theme.name === themeName)) {
        alert("Theme name already exists")
        return
      }
  
      // Add new theme
      customThemes.push({
        name: themeName,
        color: themeColor,
      })
  
      localStorage.setItem(`taskick_themes_${currentUser.id}`, JSON.stringify(customThemes))
  
      // Create CSS for custom theme
      createCustomThemeCSS(themeName, themeColor)
  
      // Add theme to options
      addCustomThemeOption(themeName, themeColor)
  
      closeThemeModal()
    }
  }
  
  function createCustomThemeCSS(name, color) {
    // Create CSS for custom theme
    const style = document.createElement("style")
    style.textContent = `
      .${name.toLowerCase()} {
          --primary-color: ${color};
          --primary-hover: ${adjustColor(color, -20)};
          --background-color: #f5f5f5;
          --card-bg: #ffffff;
          --text-color: #333333;
          --text-secondary: #666666;
          --border-color: #e0e0e0;
          --sidebar-bg: ${adjustColor(color, 80)};
          --sidebar-active: ${adjustColor(color, 60)};
          --header-bg: #ffffff;
          --input-bg: #ffffff;
          --shadow-color: rgba(0, 0, 0, 0.1);
      }
    `
  
    document.head.appendChild(style)
  }
  
  function adjustColor(hex, amount) {
    // Convert hex to RGB
    let r = Number.parseInt(hex.substring(1, 3), 16)
    let g = Number.parseInt(hex.substring(3, 5), 16)
    let b = Number.parseInt(hex.substring(5, 7), 16)
  
    // Adjust color
    r = Math.max(0, Math.min(255, r + amount))
    g = Math.max(0, Math.min(255, g + amount))
    b = Math.max(0, Math.min(255, b + amount))
  
    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }
  
  function addCustomThemeOption(name, color) {
    const themeOptions = document.querySelector(".theme-options")
    const addThemeCard = document.getElementById("add-theme")
  
    if (themeOptions && addThemeCard) {
      const themeCard = document.createElement("div")
      themeCard.className = "theme-card"
      themeCard.dataset.theme = name.toLowerCase()
  
      const themePreview = document.createElement("div")
      themePreview.className = "theme-preview"
      themePreview.style.backgroundColor = color
  
      const themeName = document.createElement("span")
      themeName.textContent = name
  
      themeCard.appendChild(themePreview)
      themeCard.appendChild(themeName)
  
      // Add click event
      themeCard.addEventListener("click", function () {
        // Remove active class from all cards
        document.querySelectorAll(".theme-card").forEach((card) => card.classList.remove("active"))
  
        // Add active class to clicked card
        this.classList.add("active")
  
        // Apply theme
        applyTheme(this.dataset.theme)
      })
  
      // Insert before add theme button
      themeOptions.insertBefore(themeCard, addThemeCard)
    }
  }
  
  function loadCustomThemes() {
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
    if (currentUser) {
      const customThemes = JSON.parse(localStorage.getItem(`taskick_themes_${currentUser.id}`)) || []
  
      customThemes.forEach((theme) => {
        createCustomThemeCSS(theme.name, theme.color)
        addCustomThemeOption(theme.name, theme.color)
      })
    }
  }
  
  function saveCustomizationSettings() {
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
    if (currentUser) {
      // Get auto dark mode setting
      const autoDarkMode = document.getElementById("auto-dark-mode").checked
  
      // Get active theme
      let activeTheme = "light"
      document.querySelectorAll(".theme-card").forEach((card) => {
        if (card.classList.contains("active")) {
          activeTheme = card.dataset.theme
        }
      })
  
      // Get humor level
      const humorLevel = Number.parseInt(document.getElementById("humor-slider").value)
  
      // Update user settings
      currentUser.autoDarkMode = autoDarkMode
      currentUser.theme = activeTheme
      currentUser.humorLevel = humorLevel
  
      // Save to local storage
      localStorage.setItem("taskick_current_user", JSON.stringify(currentUser))
  
      // Update users array
      const users = JSON.parse(localStorage.getItem("taskick_users")) || []
      const userIndex = users.findIndex((u) => u.id === currentUser.id)
      if (userIndex !== -1) {
        users[userIndex] = currentUser
        localStorage.setItem("taskick_users", JSON.stringify(users))
      }
  
      // Apply theme
      applyTheme(activeTheme)
  
      // Show success message
      showToast("Customization settings saved successfully!")
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
  
  
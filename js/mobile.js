// Handle mobile-specific functionality
document.addEventListener("DOMContentLoaded", () => {
    // Create hamburger menu if it doesn't exist
    if (!document.querySelector(".hamburger-menu")) {
      const hamburgerMenu = document.createElement("div")
      hamburgerMenu.className = "hamburger-menu"
      hamburgerMenu.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
      `
  
      // Create header left section if it doesn't exist
      let headerLeft = document.querySelector(".header-left")
      if (!headerLeft) {
        headerLeft = document.createElement("div")
        headerLeft.className = "header-left"
        const mainHeader = document.querySelector(".main-header")
        if (mainHeader) {
          mainHeader.insertBefore(headerLeft, mainHeader.firstChild)
        }
      }
  
      // Add hamburger to header left
      if (headerLeft) {
        headerLeft.insertBefore(hamburgerMenu, headerLeft.firstChild)
      }
    }
  
    // Create sidebar overlay if it doesn't exist
    if (!document.querySelector(".sidebar-overlay")) {
      const overlay = document.createElement("div")
      overlay.className = "sidebar-overlay"
      document.body.appendChild(overlay)
    }
  
    // Get hamburger menu and overlay
    const hamburgerMenu = document.querySelector(".hamburger-menu")
    const overlay = document.querySelector(".sidebar-overlay")
  
    // Toggle sidebar when hamburger is clicked
    if (hamburgerMenu) {
      hamburgerMenu.addEventListener("click", () => {
        const sidebar = document.querySelector(".sidebar")
        if (sidebar) {
          sidebar.classList.toggle("active")
          overlay.style.display = sidebar.classList.contains("active") ? "block" : "none"
  
          // Log for debugging
          console.log("Sidebar toggled:", sidebar.classList.contains("active"))
        }
      })
    }
  
    // Close sidebar when overlay is clicked
    if (overlay) {
      overlay.addEventListener("click", () => {
        const sidebar = document.querySelector(".sidebar")
        if (sidebar) {
          sidebar.classList.remove("active")
          overlay.style.display = "none"
        }
      })
    }
  
    // Make search functional
    const searchBox = document.querySelector(".search-box")
    if (searchBox) {
      const searchInput = searchBox.querySelector("input")
      const searchButton = searchBox.querySelector("button")
  
      if (searchButton && searchInput) {
        searchButton.addEventListener("click", (e) => {
          e.preventDefault()
          const query = searchInput.value.trim()
          if (query) {
            window.location.href = `search-page.html?q=${encodeURIComponent(query)}`
          }
        })
  
        searchInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            const query = searchInput.value.trim()
            if (query) {
              window.location.href = `search-page.html?q=${encodeURIComponent(query)}`
            }
          }
        })
      }
    }
  
    // Remove the quote text on mobile
    const quoteElement = document.querySelector(".quote")
    if (quoteElement && window.innerWidth <= 768) {
      quoteElement.style.display = "none"
    }
  })
  
  // Make editTask available globally
  window.editTask = (taskId) => {
    if (typeof window.originalEditTask === "function") {
      window.originalEditTask(taskId)
    } else {
      // Store task ID in session storage
      sessionStorage.setItem("editTaskId", taskId)
  
      // Redirect to dashboard
      window.location.href = "dashboard.html"
    }
  }
  
  
// Check if user is logged in
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("taskick_current_user"))
  
    // If not logged in and not on login/register page, redirect to login
    if (!currentUser) {
      const currentPage = window.location.pathname.split("/").pop()
      if (currentPage !== "index.html" && currentPage !== "register.html" && currentPage !== "") {
        window.location.href = "index.html"
      }
    } else {
      // Update user name in sidebar
      const userNameElement = document.getElementById("user-name")
      if (userNameElement) {
        userNameElement.textContent = currentUser.name
      }
  
      // Make the user-info section clickable to redirect to user-profile.html
      const userInfoSection = document.querySelector(".user-info")
      if (userInfoSection) {
        userInfoSection.style.cursor = "pointer"
        userInfoSection.addEventListener("click", () => {
          window.location.href = "user-profile.html"
        })
      }
  
      // Add logout functionality to all pages
      const sidebar = document.querySelector(".sidebar")
      if (sidebar) {
        const logoutItem = document.createElement("li")
        logoutItem.innerHTML = '<a href="#" id="logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a>'
        document.querySelector(".nav-menu").appendChild(logoutItem)
  
        document.getElementById("logout-link").addEventListener("click", (e) => {
          e.preventDefault()
          localStorage.removeItem("taskick_current_user")
          window.location.href = "index.html"
        })
      }
    }
  })
  
  
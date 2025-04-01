document.addEventListener('DOMContentLoaded', function() {
    loadCompletedTasks('daily');
    updateProgressCircle();
    renderGraph(); // Render the graph after updating progress circle
    
    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Load tasks for selected tab
                const tab = this.dataset.tab;
                loadCompletedTasks(tab);
            });
        });
    }
});

function loadCompletedTasks(timeframe) {
    const completedTasksContainer = document.getElementById('completed-tasks');
    if (!completedTasksContainer) return;
    
    const currentUser = JSON.parse(localStorage.getItem('taskick_current_user'));
    const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || [];
    
    // Filter completed tasks based on timeframe
    const now = new Date();
    let filteredTasks = [];
    
    switch (timeframe) {
        case 'daily':
            // Tasks completed today
            filteredTasks = tasks.filter(task => {
                if (!task.completed) return false;
                const completedDate = new Date(task.completedAt || task.createdAt);
                return completedDate.toDateString() === now.toDateString();
            });
            break;
        case 'weekly':
            // Tasks completed this week
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            
            filteredTasks = tasks.filter(task => {
                if (!task.completed) return false;
                const completedDate = new Date(task.completedAt || task.createdAt);
                return completedDate >= weekStart;
            });
            break;
        case 'monthly':
            // Tasks completed this month
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            
            filteredTasks = tasks.filter(task => {
                if (!task.completed) return false;
                const completedDate = new Date(task.completedAt || task.createdAt);
                return completedDate >= monthStart;
            });
            break;
    }
    
    // Clear container
    completedTasksContainer.innerHTML = '';
    
    // Add completed tasks to the container
    if (filteredTasks.length > 0) {
        filteredTasks.forEach(task => {
            const taskElement = createCompletedTaskElement(task);
            completedTasksContainer.appendChild(taskElement);
        });
    } else {
        completedTasksContainer.innerHTML = '<div class="empty-state">No completed tasks for this period</div>';
    }
}

function createCompletedTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'completed-task';
    
    const icon = document.createElement('div');
    icon.className = 'completed-task-icon';
    icon.innerHTML = '<i class="fas fa-check-circle"></i>';
    
    const content = document.createElement('div');
    content.className = 'completed-task-content';
    
    const title = document.createElement('div');
    title.className = 'completed-task-title';
    title.textContent = task.title;
    
    const description = document.createElement('div');
    description.className = 'completed-task-description';
    description.textContent = task.description || 'No description';
    
    content.appendChild(title);
    content.appendChild(description);
    
    taskElement.appendChild(icon);
    taskElement.appendChild(content);
    
    return taskElement;
}

function updateProgressCircle() {
    const progressPercentage = document.getElementById('progress-percentage');
    if (!progressPercentage) return;
    
    const currentUser = JSON.parse(localStorage.getItem('taskick_current_user'));
    const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || [];
    
    // Calculate completion percentage
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    
    let percentage = 0;
    if (totalTasks > 0) {
        percentage = Math.round((completedTasks / totalTasks) * 100);
    }
    
    // Update percentage display
    progressPercentage.textContent = `${percentage}%`;
    
    // Update progress circle
    const progressCircle = document.getElementById('progress-circle');
    if (progressCircle) {
        progressCircle.style.background = `conic-gradient(var(--primary-color) ${percentage}%, #e0e0e0 0)`;
    }
    
    // Update achievements (if needed; remove or adjust if achievements section is removed)
    updateAchievements(percentage);
}

function updateAchievements(percentage) {
    const achievements = document.getElementById('achievements');
    if (!achievements) return;
    
    const medals = achievements.querySelectorAll('.achievement');
    if (medals[2]) {
        medals[2].style.opacity = percentage >= 25 ? '1' : '0.3';
    }
    if (medals[1]) {
        medals[1].style.opacity = percentage >= 50 ? '1' : '0.3';
    }
    if (medals[0]) {
        medals[0].style.opacity = percentage >= 75 ? '1' : '0.3';
    }
}

function renderGraph() {
    const canvas = document.getElementById('graph-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
  
    const currentUser = JSON.parse(localStorage.getItem('taskick_current_user'));
    if (!currentUser) return;
    
    const tasks = JSON.parse(localStorage.getItem(`taskick_tasks_${currentUser.id}`)) || [];
    console.log("Tasks loaded for graph:", tasks);
  
    // Function to convert date to YYYY-MM-DD format
    const formatDateToYMD = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
  
    // Get today's date in YYYY-MM-DD format
    const today = formatDateToYMD(new Date());
    console.log("Today's date:", today);
  
    // Determine the earliest date from tasks
    let earliestDate = new Date();
    earliestDate.setDate(earliestDate.getDate() - 7); // Default to 7 days back
    
    tasks.forEach(task => {
      let dateStr = task.completed ? (task.completedAt || task.createdAt) : task.createdAt;
      if (dateStr) {
        const dateObj = new Date(dateStr);
        if (dateObj < earliestDate) {
          earliestDate = dateObj;
        }
      }
    });
    
    // Set latest date as today
    const latestDate = new Date();
  
    // Generate an array of dates (labels) from earliestDate to latestDate (inclusive)
    const dates = [];
    let currentDate = new Date(earliestDate);
    currentDate.setHours(0,0,0,0);
    
    while (currentDate <= latestDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    // Format dates as YYYY-MM-DD for labels
    const labels = dates.map(date => formatDateToYMD(date));
    console.log("Date labels:", labels);
  
    // Initialize count arrays for each label
    const completedData = Array(labels.length).fill(0);
    const notCompletedData = Array(labels.length).fill(0);
  
    // Process each task and count by date
    tasks.forEach(task => {
      let dateStr;
      
      if (task.completed) {
        dateStr = task.completedAt || task.createdAt;
      } else {
        dateStr = task.createdAt;
      }
      
      if (dateStr) {
        // Convert task date to YYYY-MM-DD format for comparison
        const taskDate = formatDateToYMD(new Date(dateStr));
        console.log(`Task: ${task.title}, Date: ${taskDate}, Completed: ${task.completed}`);
        
        const index = labels.indexOf(taskDate);
        if (index !== -1) {
          if (task.completed) {
            completedData[index]++;
          } else {
            notCompletedData[index]++;
          }
        }
      }
    });
    
    console.log("Completed data:", completedData);
    console.log("Not completed data:", notCompletedData);
  
    // Clear any existing chart
    if (window.taskChart) {
      window.taskChart.destroy();
    }
  
    // Create the chart
    window.taskChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Completed Tasks',
            data: completedData,
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: false,
            tension: 0.3
          },
          {
            label: 'Not Completed Tasks',
            data: notCompletedData,
            borderColor: '#ff9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date'
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10
            }
          },
          y: {
            title: {
              display: true,
              text: 'Task Count'
            },
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0
            }
          }
        }
      }
    });
  }

// Listen for changes from other tabs
window.addEventListener('storage', function(e) {
    const currentUser = JSON.parse(localStorage.getItem('taskick_current_user'));
    if (e.key === `taskick_tasks_${currentUser.id}`) {
       updateProgressCircle();
       renderGraph(); // Make sure this is called
       const activeTab = document.querySelector('.tab-btn.active');
       if (activeTab) {
          loadCompletedTasks(activeTab.dataset.tab);
       }
    }
});

// Listen for custom "taskUpdated" events
window.addEventListener('taskUpdated', function() {
    updateProgressCircle();
    renderGraph(); // Make sure this is called
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
       loadCompletedTasks(activeTab.dataset.tab);
    }
});
App = {
    loading: false,
    contracts: {},
  
    load: async () => {
      try {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
      } catch (error) {
        console.error("Error during app initialization:", error)
        $('#error-message').text('Failed to initialize app: ' + error.message).show()
      }
    },
  
    // Updated Web3 loading function to work with modern MetaMask
    loadWeb3: async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        App.web3Provider = window.ethereum
        window.web3 = new Web3(window.ethereum)
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' })
          console.log("Connected to MetaMask")
        } catch (error) {
          console.error("User denied account access")
          throw new Error("MetaMask access denied. Please connect your wallet.")
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = window.web3.currentProvider
        window.web3 = new Web3(window.web3.currentProvider)
        console.log("Legacy web3 detected")
      }
      // Non-dapp browsers...
      else {
        const errorMsg = 'Non-Ethereum browser detected. You should consider trying MetaMask!'
        console.log(errorMsg)
        throw new Error(errorMsg)
      }
    },
  
    loadAccount: async () => {
      // Updated to use modern web3 accounts method
      try {
        const accounts = await window.web3.eth.getAccounts()
        if (accounts.length === 0) {
          throw new Error("No accounts found. Please unlock MetaMask.")
        }
        App.account = accounts[0]
        console.log("Account loaded:", App.account)
      } catch (error) {
        console.error("Error loading account:", error)
        throw error
      }
    },
  
    loadContract: async () => {
      try {
        // Create a JavaScript version of the smart contract
        const todoList = await $.getJSON('TodoList.json')
        
        // Log the current state for debugging
        console.log("Window TruffleContract:", typeof window.TruffleContract);
        console.log("Direct TruffleContract:", typeof TruffleContract); 
        
        // Try different ways to access TruffleContract
        let Contract;
        if (typeof window.TruffleContract !== 'undefined') {
          Contract = window.TruffleContract;
          console.log("Using window.TruffleContract");
        } else if (typeof TruffleContract !== 'undefined') {
          Contract = TruffleContract;
          console.log("Using direct TruffleContract");
        } else {
          const errorMsg = "TruffleContract is not defined. The library failed to load correctly.";
          console.error(errorMsg);
          $('#error-message').text(errorMsg).show();
          throw new Error(errorMsg);
        }
        
        App.contracts.TodoList = Contract(todoList);
        App.contracts.TodoList.setProvider(App.web3Provider);
  
        // Hydrate the smart contract with values from the blockchain
        try {
          App.todoList = await App.contracts.TodoList.deployed();
          
          if (!App.todoList) {
            throw new Error("TodoList contract could not be deployed.");
          }
          
          console.log("Contract loaded:", App.todoList.address);
        } catch (deployError) {
          console.error("Contract deployment error:", deployError);
          const errorMsg = "Failed to deploy contract. Make sure the contract is deployed to your blockchain and Metamask is connected to the correct network.";
          $('#error-message').text(errorMsg).show();
          throw new Error(errorMsg);
        }
      } catch (error) {
        console.error("Error loading contract:", error);
        $('#error-message').text('Contract loading error: ' + error.message).show();
        throw error;
      }
    },
  
    render: async () => {
      // Prevent double render
      if (App.loading) {
        return
      }
  
      // Update app loading state
      App.setLoading(true)
  
      // Display account address with shortened format for better UI
      const shortenedAccount = App.account ? 
        `${App.account.slice(0, 6)}...${App.account.slice(-4)}` : 
        'Not connected'
      $('#account').html(shortenedAccount)
  
      // Render Tasks
      await App.renderTasks()
  
      // Update loading state
      App.setLoading(false)
    },
  
    renderTasks: async () => {
      try {
        // Check if todoList is defined before proceeding
        if (!App.todoList) {
          throw new Error("todoList contract is not properly loaded")
        }
        
        // Load the total task count from the blockchain
        const taskCount = await App.todoList.taskCount()
        
        // Clear existing tasks
        $('#taskList').html('')
        $('#completedTaskList').html('')
  
        // Render out each task with a new task template
        for (var i = 1; i <= taskCount; i++) {
          // Fetch the task data from the blockchain
          const task = await App.todoList.tasks(i)
          const taskId = task[0].toNumber()
          const taskContent = task[1]
          const taskCompleted = task[2]
  
          // Create the html for the task
          const taskElement = $('<li class="task-item"></li>')
          const checkbox = $(`<input type="checkbox" class="task-checkbox" name="${taskId}" ${taskCompleted ? 'checked' : ''}>`)
          const content = $(`<span class="task-content">${taskContent}</span>`)
          
          // Add event listener to checkbox
          checkbox.on('click', App.toggleCompleted)
          
          // Append elements
          taskElement.append(checkbox)
          taskElement.append(content)
          
          if (taskCompleted) {
            taskElement.addClass('completed')
            $('#completedTaskList').append(taskElement)
          } else {
            $('#taskList').append(taskElement)
          }
        }
      } catch (error) {
        console.error("Error rendering tasks:", error)
        $('#taskList').html('<li>Could not load tasks. Please check the console for details.</li>')
      }
    },
  
    createTask: async () => {
      App.setLoading(true)
      const content = $('#newTask').val()
      try {
        // Check if todoList is defined
        if (!App.todoList) {
          throw new Error("Contract not properly loaded")
        }
        
        await App.todoList.createTask(content, { from: App.account })
        $('#newTask').val('') // Clear input after adding
        window.location.reload()
      } catch (error) {
        console.error("Error creating task:", error)
        alert("Could not create task. Please check if MetaMask is connected and the contract is deployed correctly.")
        App.setLoading(false)
      }
    },
  
    toggleCompleted: async (e) => {
      App.setLoading(true)
      const taskId = e.target.name
      try {
        // Check if todoList is defined
        if (!App.todoList) {
          throw new Error("Contract not properly loaded")
        }
        
        await App.todoList.toggleCompleted(taskId, { from: App.account })
        window.location.reload()
      } catch (error) {
        console.error("Error toggling task:", error)
        alert("Could not update task. Please check if MetaMask is connected.")
        App.setLoading(false)
      }
    },
  
    setLoading: (boolean) => {
      App.loading = boolean
      const loader = $('#loader')
      const content = $('#content')
      if (boolean) {
        loader.show()
        content.hide()
      } else {
        loader.hide()
        content.show()
      }
    }
  }
  
  $(() => {
    // Modern jQuery ready function
    $(document).ready(() => {
      App.load()
    })
  })
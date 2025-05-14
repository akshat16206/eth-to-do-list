App = {
    loading: false,
    contracts: {},
  
    load: async () => {
      Debug.log("App.load started");
      try {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
        Debug.log("App initialization completed successfully");
      } catch (error) {
        Debug.error("Error during app initialization: " + error.message);
        $('#error-message').text('Failed to initialize app: ' + error.message).show();
      }
    },
  
    // Updated Web3 loading function to work with modern MetaMask
    loadWeb3: async () => {
      Debug.log("Loading Web3...");
      
      // Modern dapp browsers...
      if (window.ethereum) {
        App.web3Provider = window.ethereum;
        window.web3 = new Web3(window.ethereum);
        Debug.log("Modern ethereum browser detected");
        
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          Debug.log("Connected to MetaMask");
        } catch (error) {
          Debug.error("User denied account access: " + error.message);
          throw new Error("MetaMask access denied. Please connect your wallet.");
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
        window.web3 = new Web3(window.web3.currentProvider);
        Debug.log("Legacy web3 detected");
      }
      // Non-dapp browsers...
      else {
        const errorMsg = 'Non-Ethereum browser detected. You should consider trying MetaMask!';
        Debug.error(errorMsg);
        throw new Error(errorMsg);
      }
    },
  
    loadAccount: async () => {
      Debug.log("Loading account...");
      
      // Updated to use modern web3 accounts method
      try {
        const accounts = await window.web3.eth.getAccounts();
        Debug.log("Accounts: " + JSON.stringify(accounts));
        
        if (accounts.length === 0) {
          Debug.error("No accounts found");
          throw new Error("No accounts found. Please unlock MetaMask.");
        }
        
        App.account = accounts[0];
        Debug.log("Account loaded: " + App.account);
      } catch (error) {
        Debug.error("Error loading account: " + error.message);
        throw error;
      }
    },
  
    // SIMPLIFIED CONTRACT LOADING APPROACH
    loadContract: async () => {
      Debug.log("Loading contract...");
      
      try {
        // Check if TruffleContract is available
        if (typeof TruffleContract === 'undefined') {
          if (typeof window.TruffleContract !== 'undefined') {
            Debug.log("Using window.TruffleContract");
            window.TruffleContract = window.TruffleContract;
          } else {
            Debug.error("TruffleContract is not defined");
            throw new Error("TruffleContract is not defined. Please make sure the library is loaded correctly.");
          }
        } else {
          Debug.log("TruffleContract is defined globally");
        }
  
        // Create a JavaScript version of the smart contract
        Debug.log("Fetching TodoList.json");
        const todoList = await $.getJSON('TodoList.json');
        Debug.log("TodoList.json loaded");
        
        // Create truffle contract
        const TruffleContractProvider = window.TruffleContract || TruffleContract;
        App.contracts.TodoList = TruffleContractProvider(todoList);
        App.contracts.TodoList.setProvider(App.web3Provider);
        Debug.log("Contract provider set");
  
        // Hydrate the smart contract with values from the blockchain
        Debug.log("Getting deployed contract instance");
        App.todoList = await App.contracts.TodoList.deployed();
        
        if (!App.todoList) {
          Debug.error("todoList contract was not deployed");
          throw new Error("TodoList contract could not be deployed.");
        }
        
        Debug.log("Contract loaded successfully at address: " + App.todoList.address);
      } catch (error) {
        Debug.error("Error loading contract: " + error.message);
        $('#error-message').text('Contract loading error: ' + error.message).show();
        throw error;
      }
    },
  
    render: async () => {
      Debug.log("Rendering UI...");
      
      // Prevent double render
      if (App.loading) {
        Debug.log("Already loading, skipping render");
        return;
      }
  
      // Update app loading state
      App.setLoading(true);
  
      // Display account address with shortened format for better UI
      const shortenedAccount = App.account ? 
        `${App.account.slice(0, 6)}...${App.account.slice(-4)}` : 
        'Not connected';
      $('#account').html(shortenedAccount);
      Debug.log("Account display updated: " + shortenedAccount);
  
      // Render Tasks
      await App.renderTasks();
  
      // Update loading state
      App.setLoading(false);
      Debug.log("Render complete");
    },
  
    renderTasks: async () => {
      Debug.log("Rendering tasks...");
      
      try {
        // Check if todoList is defined before proceeding
        if (!App.todoList) {
          Debug.error("todoList contract is not properly loaded");
          throw new Error("todoList contract is not properly loaded");
        }
        
        // Load the total task count from the blockchain
        Debug.log("Getting task count");
        const taskCount = await App.todoList.taskCount();
        Debug.log("Task count: " + taskCount);
        
        // Clear existing tasks
        $('#taskList').html('');
        $('#completedTaskList').html('');
  
        // Render out each task with a new task template
        Debug.log("Rendering " + taskCount + " tasks");
        for (var i = 1; i <= taskCount; i++) {
          // Fetch the task data from the blockchain
          const task = await App.todoList.tasks(i);
          const taskId = task[0].toNumber();
          const taskContent = task[1];
          const taskCompleted = task[2];
          Debug.log("Task " + taskId + ": " + taskContent + " (completed: " + taskCompleted + ")");
  
          // Create the html for the task
          const taskElement = $('<li class="task-item"></li>');
          const checkbox = $(`<input type="checkbox" class="task-checkbox" name="${taskId}" ${taskCompleted ? 'checked' : ''}>`);
          const content = $(`<span class="task-content">${taskContent}</span>`);
          
          // Add event listener to checkbox
          checkbox.on('click', App.toggleCompleted);
          
          // Append elements
          taskElement.append(checkbox);
          taskElement.append(content);
          
          if (taskCompleted) {
            taskElement.addClass('completed');
            $('#completedTaskList').append(taskElement);
          } else {
            $('#taskList').append(taskElement);
          }
        }
        Debug.log("Tasks rendered successfully");
      } catch (error) {
        Debug.error("Error rendering tasks: " + error.message);
        $('#taskList').html('<li>Could not load tasks. Please check the debug area for details.</li>');
      }
    },
  
    createTask: async () => {
      Debug.log("Creating new task...");
      App.setLoading(true);
      const content = $('#newTask').val();
      Debug.log("Task content: " + content);
      
      try {
        // Check if todoList is defined
        if (!App.todoList) {
          Debug.error("Contract not properly loaded");
          throw new Error("Contract not properly loaded");
        }
        
        Debug.log("Calling createTask on contract...");
        await App.todoList.createTask(content, { from: App.account });
        Debug.log("Task created successfully");
        
        $('#newTask').val(''); // Clear input after adding
        window.location.reload();
      } catch (error) {
        Debug.error("Error creating task: " + error.message);
        alert("Could not create task. Please check the debug area for more details.");
        App.setLoading(false);
      }
    },
  
    toggleCompleted: async (e) => {
      Debug.log("Toggling task completion...");
      App.setLoading(true);
      const taskId = e.target.name;
      Debug.log("Task ID: " + taskId);
      
      try {
        // Check if todoList is defined
        if (!App.todoList) {
          Debug.error("Contract not properly loaded");
          throw new Error("Contract not properly loaded");
        }
        
        Debug.log("Calling toggleCompleted on contract...");
        await App.todoList.toggleCompleted(taskId, { from: App.account });
        Debug.log("Task toggled successfully");
        
        window.location.reload();
      } catch (error) {
        Debug.error("Error toggling task: " + error.message);
        alert("Could not update task. Please check the debug area for more details.");
        App.setLoading(false);
      }
    },
  
    setLoading: (boolean) => {
      App.loading = boolean;
      const loader = $('#loader');
      const content = $('#content');
      if (boolean) {
        loader.show();
        content.hide();
      } else {
        loader.hide();
        content.show();
      }
    }
  }
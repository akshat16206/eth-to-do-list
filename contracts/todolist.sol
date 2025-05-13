//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract todolist {
   uint public taskcount = 0;

   struct Task {
      uint id;
      string content;
      bool completed;

   } 
   mapping(uint=> Task) public tasks;

   constructor() public{
      createtask("Check out out website");
   }

   function  createtask(string memory _content) public {
   taskcount ++;
   tasks[taskcount] = Task(taskcount,_content, false);

   }
}
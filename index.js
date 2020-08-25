var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');

var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "BentleyBear8!",
  database: "employeeTracker_DB"
});

connection.connect(function(err) {
  if (err) throw err;
  runSearch();
});

function runSearch() {
    inquirer
      .prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "Add departments", 
          "Add roles", 
          "Add employees",
          "View departments", 
          "View roles",
          "View employees",
          "Update employee roles",
          "Cancel"
        ]
      })
      .then(function(answer) {
        switch (answer.action) {
        case "Add departments":
          addDep();
          break;

        case "Add roles":
            addRol();
            break;

        case "Add employees":
            addEmp();
                break;
  
        case "View departments":
          viewDep();
          break;
  
        case "View roles":
            viewRole();
            break;

        case "View employees":
            viewEmp();
            break;

        case "Update employee roles":
          update();
          break;

        case "Cancel":
            connection.end();
            break;
        }
      });
  }

  function viewDep() {
 
        connection.query(
            "SELECT * FROM department", function(err, data) {
              if (err) throw err;
              console.table(data);
              //console.log("Your department was created successfully!");
              runSearch();
            }
          );
    };

 function viewRole() {
 
        connection.query(
            "SELECT id, title, raw_total AS salary, department_id FROM roles", function(err, data) {
              if (err) throw err;
              console.table(data);
              runSearch();
            }
          );
    };

function viewEmp() {
 
        connection.query(
            "SELECT employee.id, employee.first_name, employee.last_name, roles.title, department.name AS department, roles.raw_total AS salary FROM employee LEFT JOIN roles on employee.role_id = roles.id LEFT JOIN department on roles.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;", function(err, data) {
              if (err) throw err;
              console.table(data);
              runSearch();
            }
          );
    };

    function addDep() {
                inquirer.prompt([
                    {
                        name: "dep",
                        type: "input",
                        message: "What is the new department called?"
                    }
                ]).then(function(answer){
                    connection.query(
                        "INSERT INTO department SET ?",
                        {
                          name: answer.dep
                        },
                        function(err) {
                          if (err) throw err;
                          console.log("Your department was created successfully!");
                          runSearch();
                        }
                      );
                })
                };

        function addEmp() {
            connection.query("SELECT * FROM roles", function(err, results){
                if (err) throw err;
                inquirer.prompt([
                    {
                        name: "fname",
                        type: "input",
                        message: "What is the new employee's first name?"
                    },
                    {
                        name: "lname",
                        type: "input",
                        message: "What is the new employee's last name?"
                    },
                    {
                        name: "role",
                        type: "list",
                        message: "What is their role?",
                        choices: function() {
                            var choiceArray = [];
                            for (var i = 0; i < results.length; i++) {
                              choiceArray.push({name: results[i].title, value: results[i].id});
                            }
                            return choiceArray;
                          }
                    },
                ]).then(function(answer){
                    connection.query(
                        "INSERT INTO employee(first_name, last_name, role_id) values(?,?,?)", [answer.fname, answer.lname, answer.role], function(err) {
                          if (err) throw err;
                          console.log(answer.role);
                          runSearch();
                        }
                      );
                })
            })
            
            };

        function addRol() {
            connection.query("SELECT * FROM department", function(err, results){
                if (err) throw err;
                inquirer.prompt([
                    {
                        name: "role",
                        type: "input",
                        message: "What is the new role called?"
                    },
                    {
                        name: "salary",
                        type: "input",
                        message: "What is the role's salary?"
                    },
                    {
                        name: "department",
                        type: "list",
                        message: "What department is the role in?",
                        choices: function() {
                            var choiceArray = [];
                            for (var i = 0; i < results.length; i++) {
                              choiceArray.push({name: results[i].name, value: results[i].id});
                            }
                            return choiceArray;
                          }
                    },
                ]).then(function(answer){
                    connection.query(
                        "INSERT INTO roles(title, raw_total, department_id) values(?,?,?)", [answer.role, answer.salary, answer.department], function(err) {
                          if (err) throw err;
                          console.log(answer.department);
                          runSearch();
                        }
                      );
                })
            })
            
            };

          function update() {
            
              connection.query(
            "SELECT employee.id, employee.first_name, employee.last_name, roles.title, department.name AS department, roles.raw_total AS salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN roles on employee.role_id = roles.id LEFT JOIN department on roles.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;", function(err, data) {
              if (err) throw err;
              console.log(data);
              //console.table(data);
              inquirer.prompt([{
                type: 'list',
                name: "empId",
                message: "Please select the employee whose role you want to update",
                choices: function() {
                    var choiceArray = [];
                    for (var i = 0; i < data.length; i++) {
                      choiceArray.push({name: data[i].first_name + " " + data[i].last_name, value: data[i].id});
                    }
                    return choiceArray;
                  },
            }])
            .then(function(res){
                console.log(res);
                connection.query("SELECT title, id FROM roles", function(err, data) {
                    if (err) throw err;
                    console.log(data);
                
                inquirer.prompt([{
                    type: "list",
                    name: "newRole",
                    message: "What is their new role?",
                    choices: function() {
                        var choiceArray = [];
                        for (var i = 0; i < data.length; i++) {
                          choiceArray.push({name: data[i].title, value: data[i].id});
                        }
                        return choiceArray;
                }}])
                
                .then(function(response){
                    console.log(response)
                    connection.query("UPDATE employee SET role_id = ? WHERE id=?", [response.newRole, res.empId], ()=>{
                        console.log("Success!");
                        runSearch();
                    })
                })

            }

          );
        }
)})
};
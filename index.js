const db = require('./db/db');
const inquirer = require('inquirer');
const cTable = require('console.table');

// Initiates user prompt
promptUser();

function promptUser() {
    return inquirer
        .prompt([
            {
                type: 'list',
                message: 'Which action would you like to take?',
                name: 'selection',
                choices: [
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'Update an employee role'
                ]
            }
        ])
        .then((data) => {
            switch (data.selection) {
                case 'View all departments':
                    viewAllDepartments();
                    break;

                case 'View all roles':
                    viewAllRoles();
                    break;

                case 'View all employees':
                    viewAllEmployees();
                    break;

                case 'Add a department':
                    addDepartment();
                    break;

                case 'Add a role':
                    addRole();
                    break;

                case 'Add an employee':
                    addEmployee();
                    break;

                case 'Update an employee role':
                    updateEmployeeRole();
                    break;
            }
        });
}

// Function to view all departments
function viewAllDepartments() {
    db.query('SELECT * FROM department', function (err, results) {
        displayResults(err, results);
        promptUser();
    });
}

// Function to view all roles
function viewAllRoles() {
    db.query('SELECT * FROM role', function (err, results) {
        displayResults(err, results);
        promptUser();
    });
}

// Function to view all employees
function viewAllEmployees() {
    const query = `
      SELECT
        employees_with_managers.id AS employee_id,
        employees_with_managers.first_name,
        employees_with_managers.last_name,
        employee_info.title,
        employee_info.salary,
        employee_info.department_name,
        employees_with_managers.manager_name
      FROM employee_info
      JOIN employees_with_managers ON employee_info.role_id = employees_with_managers.role_id;
    `;

    db.query(query, function (err, results) {
        displayResults(err, results);
        promptUser();
    });
}

// Function to add a department
function addDepartment() {
    return inquirer
        .prompt([
            {
                type: 'input',
                message: 'What is the name of the new department?',
                name: 'name'
            }
        ])
        .then((data) => {
            db.query('INSERT INTO department (name) VALUES (?)', data.name, function (err, results) {
                console.log('\nNew department added. See below:');
                viewAllDepartments();
            });
        });
}

// Function to add a role
function addRole() {
    const departmentArray = [];

    db.query('SELECT * FROM department', function (err, results) {
        for (let i = 0; i < results.length; i++) {
            departmentArray.push(results[i].name);
        }

        return inquirer
            .prompt([
                {
                    type: 'input',
                    message: 'What is the name of the new role?',
                    name: 'title'
                },
                {
                    type: 'input',
                    message: 'What is the salary of the new role?',
                    name: 'salary'
                },
                {
                    type: 'list',
                    message: 'What department is the role under?',
                    name: 'department',
                    choices: departmentArray
                }
            ])
            .then((data) => {
                db.query('SELECT id FROM department WHERE department.name = ?', data.department, function (err, results) {
                    const department_id = results[0].id;
                    db.query('INSERT INTO role(title, salary, department_id) VALUES (?,?,?)', [data.title, data.salary, department_id], function (err, results) {
                        console.log('\nNew role added. See below:');
                        viewAllRoles();
                    });
                });
            });
    });
}

// ... (other functions)

// Helper function to display query results
function displayResults(err, results) {
    if (err) {
        console.error('Error:', err);
        return;
    }

    console.log('\n');
    console.table(results);
}

// ... (other functions)

const db = require('./db/db');
const inquirer = require('inquirer');
const cTable = require('console.table');
const dotenv = require('dotenv');

dotenv.config();
console.log(process.env.DB_HOST); // Access the variables using process.env

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
        .then(handleUserSelection);
}

function handleUserSelection(data) {
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
}

function viewAllDepartments() {
    executeQuery('SELECT * FROM department', viewAllDepartmentsCallback);
}

function viewAllRoles() {
    executeQuery('SELECT * FROM role', viewAllRolesCallback);
}

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

    executeQuery(query, viewAllEmployeesCallback);
}

function addDepartment() {
    inquirer
        .prompt([
            {
                type: 'input',
                message: 'What is the name of the new department?',
                name: 'name'
            }
        ])
        .then(addDepartmentCallback);
}

function addRole() {
    const departmentArray = [];
    executeQuery('SELECT * FROM department', (err, results) => {
        for (let i = 0; i < results.length; i++) {
            departmentArray.push(results[i].name);
        }
        inquirer
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
            .then(addRoleCallback);
    });
}

function addEmployee() {
    const roleArray = [];
    const managerArray = ['None']; // You can modify this based on your actual data

    // Fetch roles from the database
    db.query('SELECT * FROM role', (err, roles) => {
        if (err) {
            console.error('Error fetching roles:', err);
            return;
        }

        // Populate roleArray with role titles
        roles.forEach((role) => {
            roleArray.push(role.title);
        });

        // Fetch managers from the database
        db.query('SELECT * FROM employee', (err, managers) => {
            if (err) {
                console.error('Error fetching managers:', err);
                return;
            }

            // Populate managerArray with manager names
            managers.forEach((manager) => {
                const managerName = `${manager.first_name} ${manager.last_name}`;
                managerArray.push(managerName);
            });

            // Prompt user for new employee details
            inquirer
                .prompt([
                    {
                        type: 'input',
                        message: "Enter the employee's first name:",
                        name: 'first_name',
                    },
                    {
                        type: 'input',
                        message: "Enter the employee's last name:",
                        name: 'last_name',
                    },
                    {
                        type: 'list',
                        message: "Select the employee's role:",
                        name: 'role',
                        choices: roleArray,
                    },
                    {
                        type: 'list',
                        message: "Select the employee's manager:",
                        name: 'manager',
                        choices: managerArray,
                    },
                ])
                .then((data) => {
                    // Find the role_id based on the selected role title
                    const selectedRole = roles.find((role) => role.title === data.role);
                    const role_id = selectedRole ? selectedRole.id : null;

                    // Find the manager_id based on the selected manager name
                    const selectedManager = managers.find((manager) => {
                        const managerName = `${manager.first_name} ${manager.last_name}`;
                        return managerName === data.manager;
                    });
                    const manager_id = selectedManager ? selectedManager.id : null;

                    // Insert the new employee into the database
                    db.query(
                        'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
                        [data.first_name, data.last_name, role_id, manager_id],
                        (err, result) => {
                            if (err) {
                                console.error('Error adding employee:', err);
                                return;
                            }

                            console.log('\nNew employee added. See below:');
                            // Display the updated employee list (you can replace this with your own display logic)
                            viewAllEmployees();
                        }
                    );
                });
        });
    });
}


function updateEmployeeRole() {
    const roleArray = [];
    const employeeArray = [];
    executeQuery('SELECT * FROM role', (err, results) => {
        for (let i = 0; i < results.length; i++) {
            roleArray.push(results[i].title);
        }
        executeQuery('SELECT * FROM employee', (err, results) => {
            for (let i = 0; i < results.length; i++) {
                const employeeName = `${results[i].first_name} ${results[i].last_name}`;
                employeeArray.push(employeeName);
            }
            inquirer
                .prompt([
                    {
                        type: 'list',
                        message: 'Which employee do you want to update?',
                        name: 'employee',
                        choices: employeeArray
                    },
                    {
                        type: 'list',
                        message: "What is the employee's new role?",
                        name: 'role',
                        choices: roleArray
                    },
                ])
                .then(updateEmployeeRoleCallback);
        });
    });
}

function executeQuery(query, callback) {
    db.query(query, callback);
}

function displayResults(err, results) {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('\n');
    console.table(results);
}

// Callbacks for query results
function viewAllDepartmentsCallback(err, results) {
    displayResults(err, results);
    promptUser();
}

function viewAllRolesCallback(err, results) {
    displayResults(err, results);
    promptUser();
}

function viewAllEmployeesCallback(err, results) {
    displayResults(err, results);
    promptUser();
}

function addDepartmentCallback(data) {
    db.query('INSERT INTO department (name) VALUES (?)', data.name, (err, results) => {
        console.log('\nNew department added. See below:');
        viewAllDepartments();
    });
}

function addRoleCallback(data) {
    db.query('SELECT id FROM department WHERE department.name = ?', data.department, (err, results) => {
        const department_id = results[0].id;
        db.query('INSERT INTO role(title, salary, department_id) VALUES (?,?,?)', [data.title, data.salary, department_id], (err, results) => {
            console.log('\nNew role added. See below:');
            viewAllRoles();
        });
    });
}

function updateEmployeeRoleCallback(data) {
    db.query('SELECT id FROM role WHERE role.title = ?;', data.role, (err, results) => {
        const role_id = results[0].id;
        db.query('SELECT id FROM employee WHERE employee.first_name = ? AND employee.last_name = ?;', data.employee.split(" "), (err, results) => {
            db.query('UPDATE employee SET role_id = ? WHERE id = ?;', [role_id, results[0].id], (err, results) => {
                console.log('\nEmployee role updated. See below:');
                viewAllEmployees();
            });
        });
    });
}



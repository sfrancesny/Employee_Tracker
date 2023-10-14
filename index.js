import { prompt } from 'inquirer';
import { createConnection } from 'mysql2';

// Establish a connection to the MySQL database
const connection = createConnection({
    host: 'localhost',
    user: 'root', // your MySQL username
    password: 'password', // your MySQL password
    database: 'company_db'
});

function mainPrompt() {
    prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Exit'
            ]
        }
    ]).then(response => {
        switch (response.action) {
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
            case 'Exit':
                connection.end(); // Close the database connection
                break;
            default:
                console.log("Invalid action.");
                mainPrompt();
        }
    });
} 

function viewAllDepartments() {
    connection.query('SELECT * FROM department', (error, results) => {
        if (error) throw error;
        console.table(results);
        mainPrompt(); // Go back to main prompt
    });
}

function viewAllRoles() {
    const query = `
        SELECT role.id, role.title, role.salary, department.name as department
        FROM role
        LEFT JOIN department ON role.department_id = department.id;
    `;

    connection.query(query, (error, results) => {
        if (error) throw error;
        console.table(results);
        mainPrompt(); // Go back to main prompt
    });
}

function viewAllEmployees() {
    const query = `
        SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee e
        LEFT JOIN role ON e.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee m ON e.manager_id = m.id;
    `;

    connection.query(query, (error, results) => {
        if (error) throw error;
        console.table(results);
        mainPrompt();
    });
}

function addDepartment() {
    prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'Enter the name of the new department:',
            validate: input => {
                if (input) return true;
                else {
                    console.log("Please enter a valid department name!");
                    return false;
                }
            }
        }
    ]).then(response => {
        connection.query('INSERT INTO department (name) VALUES (?)', [response.departmentName], (error, results) => {
            if (error) throw error;
            console.log("Department added successfully!");
            mainPrompt(); // Go back to main prompt
        });
    });
}

function addRole() {
    connection.query('SELECT * FROM department', (error, departments) => {
        if (error) throw error;

        prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the title of the new role:',
                validate: input => !!input || "Title is required"
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the salary for the role:',
                validate: input => !isNaN(input) || "Please enter a valid salary"
            },
            {
                type: 'list',
                name: 'departmentId',
                message: 'Select the department for this role:',
                choices: departments.map(dept => ({ name: dept.name, value: dept.id }))
            }
        ]).then(response => {
            connection.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [response.title, response.salary, response.departmentId], (error) => {
                if (error) throw error;
                console.log("Role added successfully!");
                mainPrompt();
            });
        });
    });
}

function addEmployee() {
    // Fetch all roles
    connection.query('SELECT * FROM role', (err, roles) => {
        if (err) throw err;

        // Fetch all employees for selecting a manager
        connection.query('SELECT * FROM employee', (err, employees) => {
            if (err) throw err;

            // Prompt for employee details
            prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: 'Enter the first name of the employee:',
                    validate: input => !!input || "First name is required"
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'Enter the last name of the employee:',
                    validate: input => !!input || "Last name is required"
                },
                {
                    type: 'list',
                    name: 'roleId',
                    message: 'Select the role for the employee:',
                    choices: roles.map(role => ({
                        name: role.title,
                        value: role.id
                    }))
                },
                {
                    type: 'list',
                    name: 'managerId',
                    message: 'Select the manager for the employee:',
                    choices: employees.map(employee => ({
                        name: `${employee.first_name} ${employee.last_name}`,
                        value: employee.id
                    })).concat([{ name: 'None', value: null }])  // option for no manager
                }
            ]).then(response => {
                connection.query(
                    'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', 
                    [response.firstName, response.lastName, response.roleId, response.managerId], 
                    (err) => {
                        if (err) throw err;
                        console.log("Employee added successfully!");
                        mainPrompt();
                    }
                );
            });
        });
    });
}


function updateEmployeeRole() {
    // Fetch all employees
    connection.query('SELECT * FROM employee', (err, employees) => {
        if (err) throw err;

        prompt([
            // select an employee
            {
                type: 'list',
                name: 'selectedEmployeeId',
                message: 'Which employee\'s role do you want to update?',
                choices: employees.map(employee => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id
                }))
            }
        ]).then(response => {
            // Fetch all roles
            connection.query('SELECT * FROM role', (err, roles) => {
                if (err) throw err;

                prompt([
                    // select a role
                    {
                        type: 'list',
                        name: 'selectedRoleId',
                        message: 'Which role do you want to set for the selected employee?',
                        choices: roles.map(role => ({
                            name: role.title,
                            value: role.id
                        }))
                    }
                ]).then(newRoleResponse => {
                    // Update the employee's role
                    connection.query(
                        'UPDATE employee SET role_id = ? WHERE id = ?',
                        [newRoleResponse.selectedRoleId, response.selectedEmployeeId],
                        (err) => {
                            if (err) throw err;
                            console.log("Employee's role was updated successfully!");
                            mainPrompt();
                        }
                    );
                });
            });
        });
    });
}

mainPrompt();

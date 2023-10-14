//  index.js
import { connection } from './connection.js';
import inquirer from 'inquirer';
const _prompt = inquirer.prompt;

function mainPrompt() {
    _prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees by department',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Update an employee manager',
                'Delete a department',
                'Delete a role',
                'Delete an employee',
                'View utilized budget for a department',
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
            case 'View all employees by department': 
                viewEmployeesByDepartment();
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
            case 'Update an employee manager': 
                updateEmployeeManager();
                break;
            case 'Delete a department':
                deleteDepartment();
                break;
            case 'Delete a role':
                deleteRole();
                break;
            case 'Delete an employee':
                deleteEmployee();
                break;
            case 'View utilized budget for a department':
                viewUtilizedBudget();
                break;
            case 'Exit':
                end(); // Close the database connection
                break;
            default:
                console.log("Invalid action.");
                mainPrompt();
        }
    });
} 

// view all Departments in table 
function viewAllDepartments() {
    _query('SELECT * FROM department', (error, results) => {
        if (error) throw error;
        console.table(results);
        mainPrompt(); // Go back to main prompt
    });
}

// view all roles in table
function viewAllRoles() {
    const query = `
        SELECT role.id, role.title, role.salary, department.name as department
        FROM role
        LEFT JOIN department ON role.department_id = department.id;
    `;

    _query(query, (error, results) => {
        if (error) throw error;
        console.table(results);
        mainPrompt(); // Go back to main prompt
    });
}

// view all employees in table
function viewAllEmployees() {
    const query = `
        SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee e
        LEFT JOIN role ON e.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee m ON e.manager_id = m.id;
    `;

    _query(query, (error, results) => {
        if (error) throw error;
        console.table(results);
        mainPrompt();
    });
}

// view all employees by their departments 
function viewEmployeesByDepartment() {
    // Fetch all departments
    _query('SELECT * FROM department', (err, departments) => {
        if (err) throw err;

        prompt([
            // select a department
            {
                type: 'list',
                name: 'selectedDepartmentId',
                message: 'Which department\'s employees do you want to view?',
                choices: departments.map(dept => ({
                    name: dept.name,
                    value: dept.id
                }))
            }
        ]).then(response => {
            // Fetch all employees in the selected department
            const query = `
                SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
                FROM employee e
                LEFT JOIN role ON e.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                LEFT JOIN employee m ON e.manager_id = m.id
                WHERE department.id = ?;
            `;

            _query(query, [response.selectedDepartmentId], (err, results) => {
                if (err) throw err;
                console.table(results);
                mainPrompt();
            });
        });
    });
}

// adds a Department to the table 
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
        _query('INSERT INTO department (name) VALUES (?)', [response.departmentName], (error, results) => {
            if (error) throw error;
            console.log("Department added successfully!");
            mainPrompt(); // Go back to main prompt
        });
    });
}

// adds a role to the table
function addRole() {
    _query('SELECT * FROM department', (error, departments) => {
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
            _query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [response.title, response.salary, response.departmentId], (error) => {
                if (error) throw error;
                console.log("Role added successfully!");
                mainPrompt();
            });
        });
    });
}

// adds an employee to the table 
function addEmployee() {
    // Fetch all roles
    _query('SELECT * FROM role', (err, roles) => {
        if (err) throw err;

        // Fetch all employees for selecting a manager
        _query('SELECT * FROM employee', (err, employees) => {
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
                _query(
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

//  updates an employee's role within table 
function updateEmployeeRole() {
    // Fetch all employees
    _query('SELECT * FROM employee', (err, employees) => {
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
            _query('SELECT * FROM role', (err, roles) => {
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
                    _query(
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

//  updates a Manager within the table 
function updateEmployeeManager() {
    // Fetch all employees
    _query('SELECT * FROM employee', (err, employees) => {
        if (err) throw err;

        prompt([
            // select an employee
            {
                type: 'list',
                name: 'selectedEmployeeId',
                message: 'Which employee\'s manager do you want to update?',
                choices: employees.map(employee => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id
                }))
            }
        ]).then(response => {
            // Fetch all managers or no manager
            const managerChoices = employees.filter(emp => emp.id !== response.selectedEmployeeId)
            .map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }))
            .concat({ name: 'None', value: null });
            
            prompt([
                // select a manager
                {
                    type: 'list',
                    name: 'selectedManagerId',
                    message: 'Who is the new manager for the selected employee?',
                    choices: managerChoices
                }
            ]).then(newManagerResponse => {
                // updates the employee's manager
                _query(
                    'UPDATE employee SET manager_id = ? WHERE id = ?',
                    [newManagerResponse.selectedManagerId, response.selectedEmployeeId],
                    (err) => {
                        if (err) throw err;
                        console.log("Employee's manager was updated successfully!");
                        mainPrompt();
                    }
                );
            });
        });
    });
}

// allows you to delete a Department from table 
function deleteDepartment() {
    // Fetch all departments
    _query('SELECT * FROM department', (err, departments) => {
        if (err) throw err;

        prompt([
            {
                type: 'list',
                name: 'selectedDepartmentId',
                message: 'Which department do you want to delete?',
                choices: departments.map(dept => ({
                    name: dept.name,
                    value: dept.id
                }))
            }
        ]).then(response => {
            _query('DELETE FROM department WHERE id = ?', [response.selectedDepartmentId], (err) => {
                if (err) throw err;
                console.log("Department deleted successfully!");
                mainPrompt();
            });
        });
    });
}

//  allows you to delete a role within the table 
function deleteRole() {
    // Fetch all roles
    _query('SELECT * FROM role', (err, roles) => {
        if (err) throw err;

        prompt([
            {
                type: 'list',
                name: 'selectedRoleId',
                message: 'Which role do you want to delete?',
                choices: roles.map(role => ({
                    name: role.title,
                    value: role.id
                }))
            }
        ]).then(response => {
            _query('DELETE FROM role WHERE id = ?', [response.selectedRoleId], (err) => {
                if (err) throw err;
                console.log("Role deleted successfully!");
                mainPrompt();
            });
        });
    });
}

// allows you to delete an employee from the table 
function deleteEmployee() {
    fetchRecordsFromTable('employee', (employees) => {
        const employeeChoices = employees.map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id
        }));

        promptForSelection('Which employee do you want to delete?', employeeChoices, (response) => {
            _query('DELETE FROM employee WHERE id = ?', [response.selectedId], (err) => {
                if (err) handleDatabaseError(err);
                else {
                    console.log("Employee deleted successfully!");
                    mainPrompt();
                }
            });
        });
    });
}

// allows you to view the department's budget
function viewUtilizedBudget() {
    // First, let's prompt the user to select a department
    _query('SELECT * FROM department', (err, departments) => {
        if (err) throw err;

        prompt([
            {
                type: 'list',
                name: 'departmentId',
                message: 'Select a department to view its utilized budget:',
                choices: departments.map(dept => ({ name: dept.name, value: dept.id }))
            }
        ]).then(response => {
            const query = `
                SELECT department.name AS Department, SUM(role.salary) AS UtilizedBudget
                FROM employee
                JOIN role ON employee.role_id = role.id
                JOIN department ON role.department_id = department.id
                WHERE department.id = ?
                GROUP BY department.name;
            `;

            _query(query, [response.departmentId], (err, results) => {
                if (err) throw err;
                
                if (results.length > 0) {
                    console.log(`Utilized budget for ${results[0].Department}: $${results[0].UtilizedBudget}`);
                } else {
                    console.log("No utilized budget available for this department.");
                }

                mainPrompt();
            });
        });
    });
}

mainPrompt();

-- mock data
INSERT INTO department (name) VALUES ('Marketing'), ('Inventory'), ('HR'), ('IT');

-- inserts sample data into the `role` table
INSERT INTO role (title, salary, department_id) VALUES 
('Content Marketer', 71000, 1),
('Copywriter', 65000, 1),
('Inventory Manager', 78000, 2),
('HR Manager', 79500, 3),
('Systems Analyst', 93000, 4),
('Web Developer', 88000, 4);

-- inserts sample data into the `employee` table
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
('Blaire', 'Hart', 1, NULL),
('Casen', 'Dudley', 2, NULL),
('Zoie', 'Chavez', 3, 1),
('Riley', 'Parrish', 4, 2),
('Samson', 'Dennis', 5, NULL),
('Kem', 'Mackey', 6, NULL);

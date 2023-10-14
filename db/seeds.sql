-- mock data
INSERT INTO department (name) VALUES ('Marketing'), ('Inventory'), ('HR'), ('IT');

-- inserts sample data into the `role` table
INSERT INTO role (title, salary, department_id) VALUES 
('Content Marketer', 71000, 1),
('Copywriter', 65000, 1),
('Marketing Manager', 90000, 1),
('Inventory Manager', 78000, 2),
('HR Manager', 79500, 3),
('Systems Analyst', 93000, 4),
('Web Developer', 88000, 4);

-- inserts sample data into the `employee` table
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
('Blaire', 'Hart', 1, 3),
('Casen', 'Dudley', 2, 3),
('Khaleesi', 'Nyen', 2, NULL),
('Zoie', 'Chavez', 3, NULL),
('Riley', 'Parrish', 4, NULL),
('Samson', 'Dennis', 5, NULL),
('Kem', 'Mackey', 6, NULL);

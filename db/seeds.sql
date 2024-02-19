-- Adding department data
INSERT INTO department(name)
VALUES ("Marketing"), ("Finance"), ("Legal"), ("Engineering");

-- Adding role data
INSERT INTO role(title, salary, department_id)
VALUES ("Engineering Manager",150000, 4),
    ("Associate",75000, 1),
    ("Marketing Manager",125000, 2),
    ("Salesperson",95000, 2),
    ("Lawyer",200000, 3),
    ("Developer",155000, 4),
    ("DevOps",125000, 4);

-- Adding employee data
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Phil", "Sloan", 1, null),
    ("Phillip", "Slone", 3, null),
    ("Bill", "schloan", 2, 2),
    ("Jill ", "Zlone", 2, 3),
    ("Lillian", "Sloane", 3, 3),
    ("Dill", "Pickles", 4, 3);

-- Adding views
CREATE VIEW employee_info AS
(SELECT
role.id AS role_id,
role.title,
role.salary,
department.name AS department_name
FROM role 
JOIN department 
on role.department_id = department.id);

CREATE VIEW employees_with_managers AS
(SELECT emp.id,
emp.first_name,
emp.last_name,
emp.role_id,
CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
FROM employee AS manager RIGHT OUTER JOIN employee AS emp ON manager.id = emp.manager_id);


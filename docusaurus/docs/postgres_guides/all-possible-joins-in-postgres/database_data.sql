/*Inner Join*/

CREATE TABLE customers (customer_id INT PRIMARY KEY, first_name VARCHAR(30), last_name VARCHAR(30));

INSERT INTO customers (customer_id, first_name, last_name) VALUES (1, 'John', 'Doe'),(2, 'Jane','Smith'), (3, 'Bob', 'Johnson'),(4, 'Will', 'Smith');

CREATE TABLE orders (order_id INT PRIMARY KEY, customer_id INT, order_date DATE, item_name VARCHAR(30));

INSERT INTO orders (order_id, customer_id, order_date, item_name) VALUES (1, 1, '2023-09-01', 'books'),(2, 2, '2023-09-02', 'Computer parts'), (3, 3, '2023-09-03', 'mobile parts'), (5, 2, '2023-09-05', 'electronics');

/*Left, Right, and Full Outer Join*/

CREATE TABLE employees (employee_id INT PRIMARY KEY, employee_name VARCHAR(30), department VARCHAR(30));

INSERT INTO employees (employee_id, employee_name, department) VALUES (1, 'Alice', 'HR'), (2, 'John', 'IT'), (3, 'Will', 'Marketing'),(4, 'Michael', 'IT');

CREATE TABLE projects (project_id INT PRIMARY KEY, project_name VARCHAR(30), employee_id INT);

INSERT INTO projects (project_id, project_name, employee_id) VALUES (101, 'Project 1', 2), (102, 'Project 2', 3), (103, 'Project 3', 1), (104, 'Project 4', 2), (105, 'Project 5', null);

/*Cross Join*/

CREATE TABLE boys (id INT PRIMARY KEY, name VARCHAR(30), age INT);

INSERT INTO boys (id, name, age ) VALUES (1, 'Sam', 15), (2, 'Tom', 15), (3, 'John', 16);

CREATE TABLE girls (name VARCHAR(30), age INT);

INSERT INTO girls (name, age) VALUES ('Angelina', 14), ('Jannet', 15), ('Samantha', 17);

/*Self Join*/

CREATE TABLE staff (staff_id INT PRIMARY KEY, staff_name VARCHAR(30), manager_id INT);

INSERT INTO staff (staff_id, staff_name, manager_name) VALUES (1, 'John', 3), (2, 'Ken', 3), (3, 'Bob', null), (4, 'Ben', 2), (5, 'Will', 2);
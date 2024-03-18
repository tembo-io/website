# Flask

# Creating a Flask Application with Tembo CLI

## Prerequisites

Before you start, ensure you have the following installed:

1. Python
2. Tembo CLI. you can find the steps [here](../Getting_Started.md)
3. Docker, set up and running for local development

## Setup

### Step 1: Create a Virtual Environment

First, create a virtual environment to manage your project's dependencies:

```bash
python3 -m venv dev
source dev/bin/activate
```

Install the dependencies

```bash
pip install Flask psycopg2-binary
```

### Step 2: Initialize Tembo

Initialize Tembo in your project directory:

```bash
tembo init
```

Update your `tembo.toml` file to match your project's requirements. Example configuration for a data warehouse instance:

```toml
[test-instance]
environment = "dev"
instance_name = "flask-demo"
cpu = "0.25"
memory = "1Gi"
storage = "10Gi"
replicas = 1
stack_type = "DataWarehouse"
```

Set the Tembo context to local:

```bash
tembo context set --name local
```

Apply your Tembo configuration to provision the required infrastructure:

```bash
tembo apply
```

### Step 3: Create Database Initialization Script

Create a file named `init_db.py`. This script will be used to create the database tables:

```python
import psycopg2

conn_str = "postgres://postgres:postgres@flask-demo.local.tembo.io:5432"
conn = psycopg2.connect(conn_str)

# Open a cursor to perform database operations
cur = conn.cursor()

# Execute commands to drop the table if it exists, then create a new table
cur.execute('DROP TABLE IF EXISTS books;')
cur.execute('CREATE TABLE books (id serial PRIMARY KEY,'
                                 'title varchar (150) NOT NULL,'
                                 'author varchar (50) NOT NULL,'
                                 'pages_num integer NOT NULL,'
                                 'review text,'
                                 'date_added date DEFAULT CURRENT_TIMESTAMP);'
                                 )

# Insert a sample record into the table
cur.execute('INSERT INTO books (title, author, pages_num, review)'
            'VALUES (%s, %s, %s, %s)',
            ('A Tale of Two Cities', 'Charles Dickens', 489, 'A great classic!')
            )

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()
```

Run the script to initialize the database:

```bash
python init_db.py
```

### Step 4: Verify Database Setup

You can check the changes have been made by connecting to your database:

```bash
psql postgres://postgres:postgres@flask-demo.local.tembo.io:5432
```

List all tables to see if the `books` table has been created:

```sql
\dt
```

### Step 5: Basic Set-up

We will have our `app.py` file to establish the connection and read from the database

```python
import os
import psycopg2
from flask import Flask, render_template

app = Flask(__name__)

def get_db_connection():
    conn_str="postgres://postgres:postgres@flask-demo.local.tembo.io:5432"
    conn = psycopg2.connect(conn_str)
    return conn

@app.route('/')
def index():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM books;')
    books = cur.fetchall()
    cur.close()
    conn.close()
    return render_template('index.html', books=books)
```

We will also setup a basic template to show the results. Create `templates/index.html`

```html
{% block content %}
<h1>{% block title %} Books {% endblock %}</h1>
{% for book in books %}
<div class="book">
	<h3>#{{ book[0] }} - {{ book[1] }} BY {{ book[2] }}</h3>
	<i><p>({{ book[3] }} pages)</p></i>
	<p class="review">{{ book[4] }}</p>
	<i><p>Added {{ book[5] }}</p></i>
</div>
{% endfor %} {% endblock %}
```

Run you application by running

```bash
set FLASK_APP=app
set FLASK_ENV=development
flask run
```

Visit http://127.0.0.1:5000 in your web browser to see the results.

### Creating a Basic CRUD App

To create a basic CRUD application in Flask, you can now follow the directions from this Digital Ocean article from step #5: [How to Use a PostgreSQL Database in a Flask Application](https://www.digitalocean.com/community/tutorials/how-to-use-a-postgresql-database-in-a-flask-application#step-5-adding-new-books). This basic app shows how you can create a basic CRUD Flask application using Tembo CLI.

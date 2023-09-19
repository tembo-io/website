# PostgreSQL Database Access Guide

This document will guide you through the two default users and databases that are part of your PostgreSQL deployment.

## Overview

When your PostgreSQL database is deployed, it comes pre-configured with two default users:

1. `postgres`: The superuser with all administrative rights.
2. `app`: An unprivileged user that owns the `app` database.

This guide will help you understand the roles and permissions of these users and how to decide which user to use for various tasks.

## Default Users

### Superuser (`postgres`)

#### Role and Permissions

- Full administrative access to all databases and tables.
- Can create, drop, and modify databases and tables.
- Can grant and revoke permissions.

#### When to Use

- Initial setup and schema migrations.
- Backup and restore operations.
- User management tasks like creating new users and assigning roles.

### Unprivileged User (`app`)

#### Role and Permissions

- Restricted access to only the `app` database.
- Can perform CRUD (Create, Read, Update, Delete) operations on the `app` database tables but cannot alter the schema.

#### When to Use

- Routine data access and manipulation.
- Running application queries.
- Connecting application services to the database.

## Default Databases

Your PostgreSQL instance comes with two default databases:

1. `postgres`: The administrative database, usually used for management tasks.
2. `app`: The application database, owned by the `app` user.

## Choosing the Right User for Connection

- **For Administrative Tasks**: Use the `postgres` user.
- **For Application-Level Tasks**: Use the `app` user to minimize the risk and scope of operations.

## Security Best Practices

- Do not use the `postgres` superuser for routine tasks.
- Always use strong, unique passwords for database users.
- Limit IP access to trusted addresses only.

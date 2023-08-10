---
sidebar_position: 1
tags:
  - Postgres Basics
---

# Postgres Data Types

Postgres is a powerful, open-source relational database system. One of its strengths lies in its robust support for various data types. This guide will provide you with an understanding of the commonly used Postgres data types, their characteristics, and their use cases.

## Table of Contents

- [Introduction](#introduction)
- [Numeric Types](#numeric-types)
  - [Integer Types](#integer-types)
  - [Floating-Point Types](#floating-point-types)
  - [Arbitrary Precision Types](#arbitrary-precision-types)
- [Character Types](#character-types)
- [Binary Data Types](#binary-data-types)
- [Date/Time Types](#datetime-types)
- [Boolean Type](#boolean-type)
- [Enumerated Types](#enumerated-types)
- [UUID Type](#uuid-type)
- [Array Types](#array-types)
- [JSON Types](#json-types)
- [Hstore](#hstore)
- [Range Types](#range-types)
- [Conclusion](#conclusion)

## Introduction

In database systems, a data type refers to the classification of data based on its nature or characteristic, dictating what kind of data can be stored in a given column of a table. Postgres provides a variety of data types to cater to different needs.

## Numeric Types

### Integer Types

Postgres supports several types of integers:

- **smallint**: A 2-byte signed integer with a range of -32768 to 32767.
- **integer**: A 4-byte signed integer with a range of -2147483648 to 2147483647.
- **bigint**: An 8-byte signed integer with a range of -9223372036854775808 to 9223372036854775807.

### Floating-Point Types

These are approximations to real numbers:

- **real** or **float4**: A 4-byte floating-point number.
- **double precision** or **float8**: An 8-byte floating-point number.

### Arbitrary Precision Types

These types are used when precision is paramount:

- **numeric(precision, scale)**: A real number with up to `precision` digits, `scale` of them being after the decimal point.
- **decimal**: Equivalent to `numeric`, but without a precision limit.

## Character Types

Postgres provides several types to store textual data:

- **char(n)**: Fixed-length character string with space-padded.
- **varchar(n)** or **character varying(n)**: Variable-length character string with a limit of `n` characters.
- **text**: Variable-length character string without a length limit.

## Binary Data Types

For storing raw binary data:

- **bytea**: Used to store binary strings.
- **bit(n)**: Fixed-length binary string.
- **bit varying(n) or varbit(n)**: Variable-length binary string.

## Date/Time Types

Dates and times are essential data:

- **date**: For storing dates.
- **time**: Stores time of day.
- **timestamp**: Combines date and time.
- **interval**: Represents a span of time.
- **timestamptz**: A timestamp with a timezone.
- **time with time zone**: Just like `time`, but considers the timezone.

## Boolean Type

To represent the logical values:

- **boolean or bool**: Stores `TRUE`, `FALSE`, or `NULL`.

## Enumerated Types

User-defined types representing a static set of values, for instance:

```sql
CREATE TYPE mood AS ENUM ('sad', 'ok', 'happy');
```

## UUID Type

Used for storing Universally Unique Identifiers:

- **uuid**: Stores a 128-bit identifier.

## Array Types

Postgres supports one-dimensional arrays of any data type:

- **datatype[]**: For example, `integer[]` is an array of integers.

## JSON Types

For storing JSON data:

- **json**: Stores JSON data but doesn’t enforce format validity.
- **jsonb**: Stores JSON data in a binary format and supports indexing.

## Hstore

A key-value pair storage type, great for semi-structured data or attributes.

## Range Types

Used to store a range of values:

- **int4range**: For integer ranges.
- **daterange**: For date ranges.

## Conclusion

Postgres offers a wide range of data types to ensure flexibility and precision for various application needs. Selecting the appropriate data type not only guarantees data integrity but can also improve performance and optimize storage. By understanding the characteristics and use cases for each type, you can make informed decisions when designing your database schema.

---

This guide provides a high-level overview of Postgres data types. For in-depth details and advanced types, consult the official Postgres documentation.
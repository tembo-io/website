---
title: 'Rust'
sideBarTitle: 'Rust'
sideBarPosition: 999
description: Connect to Postgres using Rust
---

Install Rust by following the official [Rust documentation](https://www.rust-lang.org/tools/install).

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Create a new Rust project:

```bash
cargo new tembo_rust
cd tembo_rust
```

Install [SQLx](https://github.com/launchbadge/sqlx) into the project.

```toml
[package]
name = "tembo_rust"
version = "0.1.0"
edition = "2021"

[dependencies]
sqlx = { version = "0.8", features = ["runtime-tokio-native-tls", "postgres"] }
tokio = { version = "1.40.0", features = ["full"] }
```

Update `src/main.rs` with the following Rust code:

```rust
use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() -> Result<(), sqlx::Error> {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect("postgresql://postgres:your-password@your-host:5432/postgres").await?;

    // Make a simple query to return the given parameter (use a question mark `?` instead of `$1` for MySQL/MariaDB)
    let row: (i64,) = sqlx::query_as("SELECT $1")
        .bind(150_i64)
        .fetch_one(&pool).await?;

    println!("The value is: {}", row.0);
    assert_eq!(row.0, 150);

    Ok(())
}
```

Run the Rust code:

```bash
cargo run
```

```text
The value is: 150
```

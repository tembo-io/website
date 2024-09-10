---
title: 'Golang'
sideBarTitle: 'Golang'
sideBarPosition: 201
description: Connect to Postgres using Golang
---

**go.mod**: It's important to use lib pq version 1.10.7 or greater

``` go title="go.mod"
module github.com/sjmiller609/connect-tembo

go 1.20

require github.com/lib/pq v1.10.7
```

**main.go**

``` go title="main.go"
package main

import (
	"database/sql"
	"fmt"
	"log"
	"github.com/lib/pq"
)

func main() {
	// Connection string
	connStr := "postgresql://postgres:******@your-subdomain-here.data-1.use1.tembo.io:5432?sslmode=require"

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	defer db.Close()

	var output int

	err = db.QueryRow("SELECT 1").Scan(&output)
	if err != nil {
		log.Fatalf("QueryRow failed: %v", err)
	}

	fmt.Printf("Output: %d\n", output)
}
```

## Support and Community

If you encounter any issues, please check out our [troubleshooting guide](/docs/product/cloud/troubleshooting/connectivity) or contact [support@tembo.io](mailto:support@tembo.io).

You're also welcome to join our [Tembo Community](https://join.slack.com/t/tembocommunity/shared_invite/zt-23o25qt91-AnZoC1jhLMLubwia4GeNGw) to meet and collaborate with other Tembo users.

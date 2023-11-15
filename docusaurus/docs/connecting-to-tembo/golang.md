**go.mod**: It's important to use lib pq version 1.10.7 or greater
```
module github.com/sjmiller609/connect-tembo

go 1.20

require github.com/lib/pq v1.10.7
```

**main.go**
```
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

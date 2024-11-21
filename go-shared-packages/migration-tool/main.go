package migration_tool

import (
	"database/sql"
	"fmt"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
)

func MigrateUP(db *sql.DB, serviceName, databaseType, databaseName string, dev bool) error {
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return err
	}

	var sourceURL string
	if dev {
		sourceURL = fmt.Sprintf("file://../migrations-package/%s/%s", serviceName, databaseType)
	} else {
		sourceURL = fmt.Sprintf("file:///migrations-package/%s/%s", serviceName, databaseType)
	}

	m, err := migrate.NewWithDatabaseInstance(sourceURL, databaseName, driver)
	if err != nil {
		return err
	}

	err = m.Up()
	if err != nil {
		return err
	}

	return nil
}

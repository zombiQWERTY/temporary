package sql_pool

import (
	"context"
	"github.com/jinzhu/gorm"
)

type sqlkey string
type indexkey int

const sqlIndex indexkey = iota + 1

// SQL retrieves the *gorm.DB with the given name or nil.
func SQL(ctx context.Context, name string) *gorm.DB {
	db, _ := ctx.Value(sqlkey(name)).(*gorm.DB)
	return db
}

// WithSQL returns a new context containing the given *gorm.DB
func WithSQL(ctx context.Context, name string, db *gorm.DB) context.Context {
	key := sqlkey(name)
	if idx := SqlIndexFrom(ctx); idx != nil {
		idx[key] = db
	} else {
		idx = map[sqlkey]*gorm.DB{key: db}
		ctx = withSQLIndex(ctx, idx)
	}
	return context.WithValue(ctx, key, db)
}

// OpenSQL opens a SQL connection and returns a new context or panics.
func OpenSQL(ctx context.Context, name, driver, dataSource string) (context.Context, error) {
	db, err := gorm.Open(driver, dataSource)
	if err != nil {
		return ctx, err
	}
	return WithSQL(ctx, name, db), nil
}

// CloseSQL closes the specified SQL connection, panciking if Close returns an error.
// CloseSQL will do nothing if the given SQL connection does not exist.
func CloseSQL(ctx context.Context, name string) context.Context {
	db := SQL(ctx, name)
	if db == nil {
		return ctx
	}

	if err := db.Close(); err != nil {
		panic(err)
	}
	return removeSQL(ctx, name)
}

// CloseSQLAll closes all open SQL connections and returns a new context without them.
func CloseSQLAll(ctx context.Context) context.Context {
	if idx := SqlIndexFrom(ctx); idx != nil {
		for name, _ := range idx {
			ctx = CloseSQL(ctx, string(name))
		}
	}
	return ctx
}

func removeSQL(ctx context.Context, name string) context.Context {
	key := sqlkey(name)
	if idx := SqlIndexFrom(ctx); idx != nil {
		delete(idx, key)
	}
	return context.WithValue(ctx, key, nil)
}

func SqlIndexFrom(ctx context.Context) map[sqlkey]*gorm.DB {
	idx, _ := ctx.Value(sqlIndex).(map[sqlkey]*gorm.DB)
	return idx
}

func withSQLIndex(ctx context.Context, idx map[sqlkey]*gorm.DB) context.Context {
	return context.WithValue(ctx, sqlIndex, idx)
}

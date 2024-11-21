package models

import "time"

type BaseModel struct {
	ID        uint32     `gorm:"primary_key" json:"id"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

type CompanyData struct {
	Name string `json:"name"`
}

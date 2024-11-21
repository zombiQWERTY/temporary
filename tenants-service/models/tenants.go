package models

import "time"

type Tenant struct {
	ID        uint32     `gorm:"primary_key" json:"id"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `sql:"index" json:"-"`

	Name   string `gorm:"type:varchar(62) unique" json:"name,omitempty"`
	Domain string `gorm:"type:varchar(62)" json:"domain,omitempty"`
}

type CompanyData struct {
	Name string `json:"name"`
}

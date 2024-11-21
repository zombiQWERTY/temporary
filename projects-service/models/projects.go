package models

import (
	"time"
)

type Project struct {
	ID        uint32     `gorm:"primary_key" json:"id"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `sql:"index" json:"-"`

	Slug        string  `gorm:"type:varchar(4) unique" json:"slug"`
	Name        string  `gorm:"type:varchar(100)" json:"name"`
	Description *string `gorm:"type:varchar(500)" json:"description"`
	Creator     uint32  `gorm:"type:integer" json:"creator"`
	Starred     bool    `gorm:"-" json:"starred"`

	Spaces []Space `json:"spaces,omitempty"`
}

type ProjectCreateRequest struct {
	Slug        string  `valid:"stringlength(2|4),alpha,required"`
	Name        string  `valid:"stringlength(5|100),required"`
	Description *string `valid:"stringlength(0|500),optional"`
}

type ProjectEditRequest struct {
	Name        string `valid:"stringlength(5|100),optional"`
	Description string `valid:"stringlength(0|500),optional"`
}

type Starred struct {
	ID        uint32
	Essence   string
	UserID    uint32
	SpaceID   *uint32
	ProjectID *uint32
}

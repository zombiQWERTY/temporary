package models

import (
	"time"
)

type Space struct {
	ID        uint32     `gorm:"primary_key" json:"id"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `sql:"index" json:"-"`

	Name        string `gorm:"type:varchar(100)" json:"name"`
	Creator     uint32 `gorm:"type:integer" json:"creator"`
	CustomOrder int32  `gorm:"type:integer" json:"order"`
	Starred     bool   `json:"starred"`

	ProjectId  uint32 `json:"projectId"`
	CasesCount uint32 `gorm:"-" json:"casesCount"`
	RunsCount  uint32 `gorm:"-" json:"runsCount"`
}

type SpaceCreateRequest struct {
	Name      string `valid:"stringlength(5|100),required"`
	ProjectId uint32 `valid:"int,required"`
}

type SpaceEditRequest struct {
	Name        string `valid:"stringlength(5|100),optional"`
	CustomOrder int32  `valid:"int,optional"`
}

package models

import (
	"time"
)

type StepGroup struct {
	ID        uint32     `gorm:"primary_key" json:"id"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `sql:"index" json:"-"`

	Result      string `gorm:"type:varchar(1024)" json:"result"`
	Creator     uint32 `gorm:"type:integer" json:"creator"`
	CustomOrder uint32 `gorm:"type:integer" json:"order"`

	Case uint32 `gorm:"type:integer" json:"case"`

	Steps []Step `json:"steps,omitempty"`
}

type StepGroupCreateRequest struct {
	Result string `valid:"stringlength(2|1024),required"`
}

type StepGroupEditRequest struct {
	Result      string `valid:"stringlength(2|1024),required"`
	CustomOrder uint32 `valid:"int,optional"`
}

type Step struct {
	ID        uint32     `gorm:"primary_key" json:"id"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `sql:"index" json:"-"`

	Content     string `gorm:"type:varchar(1024)" json:"content"`
	Creator     uint32 `gorm:"type:integer" json:"creator"`
	CustomOrder uint32 `gorm:"type:integer" json:"order"`

	StepGroup uint32 `gorm:"type:integer" json:"stepGroup"`
}

type StepCreateRequest struct {
	StepGroupID uint32 `valid:"int,required"`
	Content     string `valid:"stringlength(2|1024),required"`
}

type StepEditRequest struct {
	Content     string `valid:"stringlength(2|1024),required"`
	CustomOrder uint32 `valid:"int,optional"`
}

package models

import (
	"database/sql/driver"
	"time"
)

type CaseStatus string

const (
	Ready    CaseStatus = "ready"
	Draft    CaseStatus = "draft"
	Archived CaseStatus = "archived"
	Broken   CaseStatus = "broken"
)

func (s *CaseStatus) Scan(value interface{}) error {
	*s = CaseStatus(value.([]byte))
	return nil
}

func (s CaseStatus) Value() (driver.Value, error) {
	return string(s), nil
}

type CasePriority string

const (
	Low    CasePriority = "low"
	Medium CasePriority = "medium"
	High   CasePriority = "high"
)

func (s *CasePriority) Scan(value interface{}) error {
	*s = CasePriority(value.([]byte))
	return nil
}

func (s CasePriority) Value() (driver.Value, error) {
	return string(s), nil
}

type Case struct {
	ID        uint32     `gorm:"primary_key" json:"id"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `sql:"index" json:"-"`

	Title         string       `gorm:"type:varchar(100)" json:"title"`
	Description   *string      `gorm:"type:varchar(1024)" json:"description"`
	Preconditions *string      `gorm:"type:varchar(1024)" json:"preconditions"`
	Creator       uint32       `gorm:"type:integer" json:"creator"`
	CustomOrder   uint32       `gorm:"type:integer" json:"order"`
	CustomID      uint32       `gorm:"type:integer" json:"customID"`
	Status        CaseStatus   `sql:"type:case_status" json:"status"`
	Priority      CasePriority `sql:"type:case_priority" json:"priority"`

	Project uint32  `gorm:"type:integer" json:"project"`
	Space   uint32  `gorm:"type:integer" json:"space"`
	Folder  *uint32 `gorm:"type:integer" json:"folder"`

	StepGroups []StepGroup `json:"stepGroups,omitempty"`
}

type CaseCreateRequest struct {
	Title         string       `valid:"stringlength(2|100),required"`
	Description   *string      `valid:"stringlength(0|1024),optional"`
	Preconditions *string      `valid:"stringlength(0|1024),optional"`
	Folder        *uint32      `valid:"int,optional"`
	Priority      CasePriority `valid:"required"`
	Status        CaseStatus   `valid:"required"`
}

type CaseEditRequest struct {
	Title         *string      `valid:"stringlength(2|100),optional"`
	Description   *string      `valid:"stringlength(0|1024),optional"`
	Preconditions *string      `valid:"stringlength(0|1024),optional"`
	Priority      CasePriority `valid:"optional"`
	Status        CaseStatus   `valid:"optional"`
	CustomOrder   uint32       `valid:"int,optional"`
}

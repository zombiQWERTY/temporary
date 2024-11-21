package models

import "time"

type Permission struct {
	ID        uint32     `gorm:"primary_key" json:"id"`
	DeletedAt *time.Time `sql:"index" json:"-"`

	Name    string `gorm:"type:varchar(255) unique"`
	Essence string `gorm:"type:varchar(255)"`

	Users []User `gorm:"many2many:user_has_permissions;"json:"-"`
}

type UserHasPermissions struct {
	UserID       uint32
	PermissionID uint32
	ModelID      *uint32
	Name         string
	Essence      string
}

type AccessByModelID struct {
	HasAccess bool
	ModelID   uint32
}

type CheckAccessRequest struct {
	TenantID string
	PermName string
	UserID   uint32
	ModelIDs []uint32
}

type CheckAccessResponse struct {
	Access []AccessByModelID
}

package models

import (
	"bitbucket.org/ittinc/go-shared-packages/shared-middleware"
	"database/sql/driver"
)

type userStatus string

const (
	UserInvited userStatus = "invited"
	UserActive  userStatus = "active"
	UserBlocked userStatus = "blocked"
	UserRemoved userStatus = "removed"
)

// db.Create(&User{ Name: "alice", Status: UserActive })

func (s *userStatus) Scan(value interface{}) error {
	*s = userStatus(value.([]byte))
	return nil
}

func (s userStatus) Value() (driver.Value, error) {
	return string(s), nil
}

type User struct {
	BaseModel

	Email     string     `gorm:"type:varchar(100) unique" json:"email,omitempty"`
	Phone     *string    `gorm:"type:varchar(32)" json:"phone"`
	FirstName string     `gorm:"type:varchar(64)" json:"firstName"`
	LastName  string     `gorm:"type:varchar(64)" json:"lastName"`
	ShortName string     `gorm:"type:varchar(64) unique" json:"shortName"`
	OtherInfo *string    `gorm:"type:varchar(500)" json:"otherInfo"`
	Status    userStatus `sql:"type:user_status" json:"status"`

	Password string `gorm:"type:varchar(128)" json:"-"`
	Salt     string `gorm:"type:varchar(64)" json:"-"`

	Permissions    []Permission                       `gorm:"many2many:user_has_permissions" json:"-"`
	PermissionList []shared_middleware.PermissionList `gorm:"-" json:"permissionList,omitempty"`

	Owner bool `gorm:"-" json:"owner,omitempty"`
}

type UserCreateRequest struct {
	ID        uint32  `valid:"optional"`
	Token     string  `valid:"required"`
	Phone     *string `valid:"stringlength(4|32),optional"`
	FirstName string  `valid:"stringlength(2|20),required"`
	LastName  string  `valid:"stringlength(2|20),required"`
	ShortName string  `valid:"stringlength(2|20),nospace,required"`
	Password  string  `valid:"stringlength(6|128),required"`
	OtherInfo *string `valid:"stringlength(0|500),optional"`
}

type OwnerCreateRequest struct {
	TenantID  string `valid:"stringlength(3|30),required"`
	Email     string `valid:"stringlength(3|100),email,required"`
	FirstName string `valid:"stringlength(2|20),required"`
	LastName  string `valid:"stringlength(2|20),required"`
	Password  string `valid:"stringlength(6|128),required"`
}

type GetUserRequest struct {
	TenantID string `valid:"stringlength(3|30),required"`
	ID       uint32 `valid:"int,required"`
}

type GetUsersByIDRequest struct {
	TenantID string   `valid:"stringlength(3|30),required"`
	ID       []uint32 `valid:"int,required"`
}

type UserLoginRequest struct {
	Email    string `valid:"stringlength(3|100),email,required"`
	Password string `valid:"stringlength(6|128),required"`
}

type RefreshTokenRequest struct {
	RefreshToken string `valid:"required"`
}

type LogoutRequest struct {
	AccessToken  string `valid:"required"`
	RefreshToken string `valid:"required"`
}

type GetInvitedInfo struct {
	Token string `valid:"required"`
}

type PatchUserRequest struct {
	Phone     string `valid:"stringlength(4|32),optional"`
	FirstName string `valid:"stringlength(2|20),optional"`
	LastName  string `valid:"stringlength(2|20),optional"`
	ShortName string `valid:"stringlength(2|20),nospace,optional"`
	OtherInfo string `valid:"stringlength(0|500),nospace,optional"`
}

type CheckUserMetaExistsRequest struct {
	Email     string `valid:"stringlength(3|100),email,optional"`
	ShortName string `valid:"stringlength(2|20),nospace,optional"`
}

// Common interfaces

type Login struct {
	Email string
}

type RefreshToken struct {
	RefreshToken string
}

type Logout struct {
	RefreshToken string
	AccessToken  string
}

type InviteUser struct {
	Email       string                             `valid:"stringlength(3|100),email,required"`
	FirstName   *string                            `valid:"stringlength(2|20),optional"`
	LastName    *string                            `valid:"stringlength(2|20),optional"`
	Permissions []shared_middleware.PermissionList `valid:"optional"`
}

type EditUser struct {
	ID          uint32                             `valid:"int,required"`
	Email       *string                            `valid:"stringlength(3|100),email,optional"`
	FirstName   *string                            `valid:"stringlength(2|20),optional"`
	LastName    *string                            `valid:"stringlength(2|20),optional"`
	Permissions []shared_middleware.PermissionList `valid:"optional"`
}

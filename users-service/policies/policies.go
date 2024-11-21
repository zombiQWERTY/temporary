package policies

import (
	"bitbucket.org/ittinc/go-shared-packages/policy-manager"
	"context"
)

//id, _ := c.Value("id").(uint32)
//permissions, _ := c.Value("permissions").([]middleware.PermissionList)

func InitPolicies() {
	policy_manager.RegisterPolicy("users", policy_manager.PolicyMap{
		"CanReadAllUsers": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanReadAllUsers")
		},
		"CanInviteUsers": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanInviteUsers")
		},
		"CanEditAllUsers": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanEditAllUsers")
		},
		"CanDeleteAllUsers": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanDeleteAllUsers")
		},
		"CanGrantReadSomeProjects": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanGrantReadSomeProjects")
		},
		"CanGrantEditSomeProjects": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanGrantEditSomeProjects")
		},
		"CanGrantDeleteSomeProjects": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanGrantDeleteSomeProjects")
		},
	})
}

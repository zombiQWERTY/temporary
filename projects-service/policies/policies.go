package policies

import (
	"bitbucket.org/ittinc/go-shared-packages/policy-manager"
	"context"
)

//id, _ := c.Value("id").(uint32)
//permissions, _ := c.Value("permissions").([]middleware.PermissionList)

func InitPolicies() {
	policy_manager.RegisterPolicy("projects", policy_manager.PolicyMap{
		"CanCreateProjects": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanCreateProjects")
		},
		"CanEditAllProjects": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanEditAllProjects")
		},
		"CanEditSomeProjects": func(c context.Context, args ...interface{}) bool {
			projectID := args[0].(uint32)
			return policy_manager.Contains(c.Value("permissions"), "CanEditSomeProjects", []uint32{projectID})
		},
		"CanReadAllProjects": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanReadAllProjects")
		},
		"CanDeleteAllProjects": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanDeleteAllProjects")
		},
		"CanDeleteSomeProjects": func(c context.Context, args ...interface{}) bool {
			projectID := args[0].(uint32)
			return policy_manager.Contains(c.Value("permissions"), "CanDeleteSomeProjects", []uint32{projectID})
		},
		"CanCreateSpaceInAllProjects": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanCreateSpaceInAllProjects")
		},
		"CanCreateSpaceInSomeProjects": func(c context.Context, args ...interface{}) bool {
			projectID := args[0].(uint32)
			return policy_manager.Contains(c.Value("permissions"), "CanCreateSpaceInSomeProjects", []uint32{projectID})
		},
	})
	policy_manager.RegisterPolicy("spaces", policy_manager.PolicyMap{
		"CanEditAllSpaces": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanEditAllSpaces")
		},
		"CanDeleteAllSpaces": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanDeleteAllSpaces")
		},
	})
}

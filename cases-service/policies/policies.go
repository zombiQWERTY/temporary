package policies

import (
	"bitbucket.org/ittinc/go-shared-packages/policy-manager"
	"context"
)

//id, _ := c.Value("id").(uint32)
//permissions, _ := c.Value("permissions").([]middleware.PermissionList)

func InitPolicies() {
	policy_manager.RegisterPolicy("cases", policy_manager.PolicyMap{
		"CanCreateCase": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanCreateCase")
		},
		"CanDeleteAllCases": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanDeleteAllCases")
		},
		"CanDeleteSomeCases": func(c context.Context, args ...interface{}) bool {
			caseID := args[0].(uint32)
			return policy_manager.Contains(c.Value("permissions"), "CanDeleteSomeCases", []uint32{caseID})
		},
		"CanEditAllCases": func(c context.Context, args ...interface{}) bool {
			return policy_manager.Contains(c.Value("permissions"), "CanEditAllCases")
		},
		"CanEditSomeCases": func(c context.Context, args ...interface{}) bool {
			caseID := args[0].(uint32)
			return policy_manager.Contains(c.Value("permissions"), "CanEditSomeCases", []uint32{caseID})
		},
	})
}

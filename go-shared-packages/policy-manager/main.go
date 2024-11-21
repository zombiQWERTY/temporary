package policy_manager

import (
	"context"
	"encoding/json"
	"strings"
)

func Contains(a interface{}, x string, arg ...interface{}) bool {
	var permMap []map[string]json.RawMessage
	permJson, _ := json.Marshal(a)
	err := json.Unmarshal(permJson, &permMap)
	if err != nil {
		return false
	}

	for _, p := range permMap {
		pName := strings.Replace(string(p["name"]), `"`, "", 2)

		modelsCheck := true
		IDs := make([]uint32, 0)
		if len(arg) > 0 {
			IDs = arg[0].([]uint32)
		}

		if len(IDs) > 0 {
			modelsCheck = false
			models := make([]uint32, 0)
			err := json.Unmarshal(p["models"], &models)
			if err == nil {
				for _, m := range models {
					for _, id := range IDs {
						if id == m {
							modelsCheck = true
							break
						}
					}
				}
			}
		}

		if pName == x && modelsCheck {
			return true
		}
	}
	return false
}

type PolicyMap map[string]func(ctx context.Context, args ...interface{}) bool

type PolicyStore struct {
	policies map[string]PolicyMap
}

var store PolicyStore

func RegisterPolicy(name string, p PolicyMap) {
	if store.policies == nil {
		store.policies = make(map[string]PolicyMap)
	}

	store.policies[name] = p
}

func Check(c context.Context, policy string, ability string, args ...interface{}) bool {
	if store.policies[policy] == nil || store.policies[policy][ability] == nil {
		return false
	}

	callback := store.policies[policy][ability]
	return callback(c, args...)
}

/**
Usage:
permission.policy_manager(ctx, "users", "canEditSomething")
*/

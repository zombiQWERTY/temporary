package shared_middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
)

type PermissionList struct {
	ID      uint32   `json:"id" valid:"int,required"`
	UserID  uint32   `json:"-" valid:"-"`
	Name    string   `json:"name" valid:"-"`
	Essence string   `json:"essence" valid:"-"`
	Models  []uint32 `json:"models,omitempty" valid:"int,optional"`
}

func updateContextUserModel(c context.Context, userId uint32, permissions []PermissionList) context.Context {
	ctx := context.WithValue(c, "id", userId)
	ctx = context.WithValue(ctx, "permissions", permissions)

	return ctx
}

func updateContextTenantModel(c context.Context, tenant string) context.Context {
	ctx := context.WithValue(c, "tenant", tenant)
	return ctx
}

func ParseContextUserModel(c context.Context) (uint32, []PermissionList) {
	id, _ := c.Value("id").(uint32)
	permissions, _ := c.Value("permissions").([]PermissionList)

	return id, permissions
}

func ParseContextTenantModel(c context.Context) string {
	tenant, _ := c.Value("tenant").(string)
	return tenant
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := updateContextUserModel(r.Context(), 0, []PermissionList{})

		userID := r.Header.Get("X-Forwarded-User")
		userId64, _ := strconv.ParseUint(userID, 10, 32)

		var permissions []PermissionList
		permissionsHeaderValue := r.Header.Get("X-Forwarded-Permissions")
		_ = json.Unmarshal([]byte(permissionsHeaderValue), &permissions)

		ctx = updateContextUserModel(ctx, uint32(userId64), permissions)
		next.ServeHTTP(w, r.WithContext(ctx))
		return
	})
}

func TenantMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := updateContextTenantModel(r.Context(), "")
		tenant := r.Header.Get("X-Forwarded-Tenant")
		ctx = updateContextTenantModel(ctx, tenant)
		next.ServeHTTP(w, r.WithContext(ctx))
		return
	})
}

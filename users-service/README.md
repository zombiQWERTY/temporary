Migrations:
docker exec -ti users_service  ./migrate -database postgresql://doqa:123@postgres_users_service:5432/test?sslmode=disable -path ../migrations-package/users-service/postgres up

CLI:
docker exec -ti users_service  ./cli-app --tenant test -ca consul -cp 8500 users add --e admin@test.com -p 123123123

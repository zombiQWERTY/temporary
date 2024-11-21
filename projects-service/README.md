Migrations:
docker exec -ti projects_service  ./migrate -database postgresql://doqa:123@projects_users_service:5432/test?sslmode=disable -path ../migrations-package/projects-service/postgres up

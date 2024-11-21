# Run


Sample .env file:
```
DOCKER_GIT_CREDENTIALS=https://user:token@bitbucket.org
GOPRIVATE=bitbucket.org/path
```


Sample mongo-prod dockerfile
```
  mongo_blacklist_service:
    image: mongo
    container_name: "mongo_blacklist_service"
    volumes:
      - "./containers-prod/blacklist-service/mongo/data/db:/data/db"
    environment:
      - "MONGO_DATA_DIR=/data/db"
      - "MONGODB_USER=${MONGO_USER:-doqa}"
      - "MONGODB_PASS=${MONGO_PASS:-123}"
    command: mongod
    restart: always

```
Sample mongo-dev dockerfile
```
  mongo_blacklist_service:
    image: mongo
    container_name: "mongo_blacklist_service"
    volumes:
      - "./containers-dev/blacklist-service/mongo/data/db:/data/db"
    ports:
      - "27018:27017"
    environment:
      - "MONGO_DATA_DIR=/data/db"
      - "MONGODB_USER=${MONGO_USER:-doqa}"
      - "MONGODB_PASS=${MONGO_PASS:-123}"
    command: mongod
    restart: always

```

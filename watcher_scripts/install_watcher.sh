#docker compose pull
docker compose down
docker compose up -d
docker-compose ps -a | grep 'Created' | awk '{print $1}' | xargs docker start


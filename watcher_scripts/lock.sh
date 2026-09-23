API_KEY=$1
DIR_NUM=$2

curl -X POST http://localhost:303$DIR_NUM/api/permit -H "Content-Type: application/json" -H "Api-Key: $API_KEY" -d '{"count":"15100000"}'

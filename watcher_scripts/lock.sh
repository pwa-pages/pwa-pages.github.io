API_KEY=$1

curl -X POST http://localhost:3031/api/permit -H "Content-Type: application/json" -H "Api-Key: $API_KEY" -d '{"count":"15100000"}'

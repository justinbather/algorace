#!/bin/bash

# Called by DockerCompiler.js:execute()
# Usage ./docker.sh is_palindrome node node:20 .mjs output.txt is_palindrome.input

# Copies necessary files to /temp and spins up docker container with /temp mounted for code compilation
# Once running executes runner.sh script to carry out compilation and testing
# after process is done and exits, we kill and remove the container then clean up the created files

fileName=$1
executor=$2
image=$3
fileExt=$4
output=$5
input=$6

mv ./tests/$output ./temp/test.txt
mv ./tests/$fileName ./temp/$fileName

cont=$(docker run -it -d -v "$(pwd)"/temp:/temp -w /temp "$image")

docker exec "$cont" ./runner.sh $fileName $executor

output=$(docker logs "$cont")
echo "output: $output"

docker kill $cont &>/dev/null
docker rm $cont &>/dev/null

rm ./temp/$fileName

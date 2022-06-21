#!/bin/bash -eE


docker run --name aaexam-api \
  -v /root/data/aaexam:/home/node/app/data \
  -p 3025:3000 \
  --read-only \
  -d \
  aaexam-api

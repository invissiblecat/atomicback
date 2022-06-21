#!/bin/bash -eE

./build-docker.sh && ./kill-docker.sh && ./create-docker.sh && docker ps

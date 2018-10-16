#!/bin/bash

result=$(curl -s http://localhost:8081/validate/)

if [[ "$result" =~ "ok" ]]; then
    exit 0
else
    exit 1
fi
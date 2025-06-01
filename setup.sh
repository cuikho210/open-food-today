#!/usr/bin/bash

cd "$(dirname "$0")"

export $(cat ".env.local" | xargs)
alias cm=$PWD/commit.sh
alias t-s=$PWD/server/test.sh

cd -

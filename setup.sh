#!/usr/bin/bash

cd "$(dirname "$0")"

export $(cat ".env" | xargs)
alias cm=$PWD/commit.sh

PID_FILE="/tmp/flutter.pid"
alias flutter-run="cd $PWD/flutter-client && flutter run --pid-file $PID_FILE"
alias flutter-watch="find $PWD/flutter-client/lib/ -name '*.dart' | entr -p kill -USR1 \$(cat /tmp/flutter.pid)"
alias f-r="flutter-run"
alias f-w="flutter-watch"

cd -

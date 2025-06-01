#!/usr/bin/bash

export DATABASE_URL="$TEST_DATABASE_URL"
export SUPABASE_URL="$TEST_SUPABASE_URL"
export SUPABASE_ANON_KEY="$TEST_SUPABASE_ANON_KEY"

echo "Run migrate\n"
cargo run -p migrate --bin down;
cargo run -p migrate --bin up;

echo "\nRun cargo test ${@}\n"
cargo test ${@}

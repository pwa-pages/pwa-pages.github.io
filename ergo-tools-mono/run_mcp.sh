#!/usr/bin/env bash

cd /home/pebblerye/pwa/pwa-pages.github.io/ergo-tools-mono || exit 1

export MCP_TRANSPORT=stdio
export NODE_OPTIONS="--enable-source-maps"

exec ./node_modules/.bin/nx serve watcherstats_mcp

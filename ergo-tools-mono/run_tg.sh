#!/usr/bin/env bash

cd /home/pebblerye/pwa/pwa-pages.github.io/ergo-tools-mono || exit 1


exec ./node_modules/.bin/nx serve telegram_pi

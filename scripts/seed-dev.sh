#!/usr/bin/env bash
set -e
npm run db:migrate
npm run db:seed

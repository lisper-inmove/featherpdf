shell := /bin/bash

build:
	npm run build

dev:
	NEXT_PUBLIC_HOST=http://192.168.3.124:9700 npm run dev

start:
	npm run start

api:
	cd src/proto && make api-typescript


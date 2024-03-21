shell := /bin/bash

build:
	cp .env.prod .env
	npm run build
	cp .env.dev .env

dev:
	cp .env.dev .env
	NEXT_PUBLIC_HOST=http://192.168.3.124:9700 npm run dev

start:
	cp .env.prod .env
	npm run start
	cp .env.dev .env

api:
	cd src/proto && make api-typescript

bd:
	sudo docker build -t mh.com:8890/test/featherpdf:v1.0 .
	sudo docker push mh.com:8890/test/featherpdf:v1.0

rd: # restart docker
	sudo docker stop featherpdf_v1
	sudo docker rm featherpdf_v1
	sudo docker run --restart always -d --name featherpdf_v1 -p 9701:3000 mh.com:8890/test/featherpdf:v1.0

sd:
	sudo docker run --restart always -d --name featherpdf_v1 -p 9701:3000 mh.com:8890/test/featherpdf:v1.0
stop:
	sudo docker stop featherpdf_v1 && sudo docker rm featherpdf_v1


t: build start
	echo "Start"

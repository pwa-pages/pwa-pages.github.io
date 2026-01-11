nx run-many --target=build,build-common --projects=service,watcherstats --configuration=production --skip-nx-cache
./prep_server_component.sh

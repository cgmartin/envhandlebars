#!/bin/sh
# Docker-in-docker workaround

# Using socat is safer than updating the permissions of the host socket itself since this would apply to all containers.
#sudo chown ${USERNAME} /var/run/docker.sock

sudo rm -rf /var/run/docker.sock
((sudo socat UNIX-LISTEN:/var/run/docker.sock,fork,mode=660,user=${USERNAME} UNIX-CONNECT:/var/run/docker-host.sock) 2>&1 >> /tmp/vscr-dind-socat.log) & > /dev/null
"$@"

#!/bin/sh
# Docker-in-docker workaround
sudo chown ${USERNAME} /var/run/docker.sock
"$@"
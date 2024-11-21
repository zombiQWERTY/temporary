#!/bin/bash

function usage {
   cat << EOF
Usage: deregister-services.sh -id <service-id>

Deregister service in consul by id
EOF
   exit 1
}

if [ $# -ne 2 ]; then
   usage;
fi

if [ "$1" != "-id" ]; then
  usage;
fi

ID=$2

curl -s -XPUT consul.doqa.local/v1/agent/service/deregister/"$ID"

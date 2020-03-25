#!/bin/bash
SSNAME=sservice
SERVER=51.15.218.10
USER=shahd
DIS_PATH=/home/shahd/tucana
SERVICE_SCRIPT=ss_service.sh

echo "Please enter password for $SERVER:"
read PASS

sshpass -p $PASS scp $SERVICE_SCRIPT $USER@$SERVER:$DIS_PATH
sshpass -p $PASS scp server.js $USER@$SERVER:$DIS_PATH
sshpass -p $PASS scp update_service.sh $USER@$SERVER:$DIS_PATH
sshpass -p $PASS ssh -t  $USER@$SERVER chmod +x $DIS_PATH/update_service.sh
#sshpass -p $PASS ssh -t  $USER@$SERVER $DIS_PATH/update_service.sh


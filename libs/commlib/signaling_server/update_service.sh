#!/bin/bash
SSNAME=sservice
DIS_PATH=/home/shahd/tucana
PASSWORD=123456az

sudo $DIS_PATH/ss_service.sh start
#/etc/init.d/$SSNAME stop
#cp  $DIS_PATH/$SERVICE_SCRIPT "/etc/init.d/$SSNAME"
#chmod +x /etc/init.d/$SSNAME
#update-rc.d $SSNAME defaults
#/etc/init.d/$SSNAME start


echo "!!!!!!!!!!!!!!!!!!!!!!"
echo "For generation of a key, please use default folder! Otherwise, the key printed will not be the one you need to copy."
echo "!!!!!!!!!!!!!!!!!!!!!!"
ssh-keygen -t rsa -b 4096
cat ~/.ssh/id_rsa.pub

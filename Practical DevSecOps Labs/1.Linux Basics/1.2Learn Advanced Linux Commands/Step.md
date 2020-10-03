devsecops-box-hmbqeyiw$ 
142.93.2.82

ssh -i ~/.ssh/id_rsa root@prod-hmbqeyiw



nc -zv 142.93.2.82 22
ssh -i /.ssh/id_rsa root@142.93.2.82
ssh -i ~/.ssh/id_rsa root@142.93.2.82

## Learn sudo commands
```bash
sudo ls
echo -e "pdevsecops\npdevsecops" | adduser --gecos "" john ## pdevsecops
usermod -aG sudo john
sudo su - john
sudo cat /etc/shadow ## The password for this user is pdevsecops
exit
```
## Learn Secure Shell
```bash
ssh -i ~/.ssh/id_rsa root@prod-gsnmswlx
ssh -i ~/.ssh/id_rsa root@prod-gdjoljip
ssh-keyscan -H prod-gdjoljip >> ~/.ssh/known_hosts
hostname
## Run commands remotely
ssh root@prod-gdjoljip "hostname"


```
## Learn Git Basics
```bash
git config --global user.email "john@example.com"
git config --global user.name "John Doe"
git clone http://root:pdso-training@gitlab-ce-gsnmswlx.lab.practical-devsecops.training/root/django-nv.git
git clone http://root:pdso-training@gitlab-ce-gdjoljip.lab.practical-devsecops.training/root/django-nv.git
cd django-nv
ls -l
cat > myfile <<EOL
This is my file
EOL
echo "Practical DevSecOps" >> README.md
git status
git add myfile README.md
git status
git commit -m "Add myfile and update README.md"
##  https://gitlab-ce-gsnmswlx.lab.practical-devsecops.training/root/django-nv
# username: root
# password: pdso-training
git pull
```
NAME="Ubuntu"
VERSION="18.04.5 LTS (Bionic Beaver)"
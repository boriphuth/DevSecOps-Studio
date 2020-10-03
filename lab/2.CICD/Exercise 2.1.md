## DevSecOps-Box
```bash
cd DevSecOps-Studio/lab/module1
root@kali:~/lab# ​chmod 400 ubuntu.pem
root@kali:~/lab# ​ssh -i ubuntu.pem ubuntu@10.0.1.10

ubuntu@ip-10-0-1-10:~/django.nv$ cat ~/.ssh/id_rsa.pub 
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDHOrpCOh8On2h/4PVtsb9UeR6pQbW1pJixGrvDA70ba7ASaRpDrneh01iPdHHF1DqPq/BmnDslHzAcEoYos1Ji+JfaMS3mw0KGVd5W6ytIu0SO0fullDZNRMWI9mCW7eyna/uCb66uDVqusY+cv0nKujslpTT1HAY6g3r2rmYqOw4T2ZxyRVi5K+OiBcb0UsqlJ4Yft+fMgi5u70gGNwAL0V8wJAQ4U2Ih7IjGO8SDKqv0Grnoy3QPHt7610qe8/fSBaihzFrydId4fy9L1/JXlIy9jEHQYpItfIOFoqD9b8wiCvEhkiP1/sRgDdoIQphitchzDeXGlsmiNN6Y/dPl vagrant

## Exercise 2.1 Create a docker image
ubuntu@DevSecOps-Box:~$ ​git clone git@gitlab.local:root/django.nv.git
ubuntu@ip-10-0-1-10:~/django.nv$ ​docker build --tag django.nv:1.0 .
ubuntu@ip-10-0-1-10:~/django.nv$ cat Dockerfile

## Exercise 2.2 Store the docker image in Registry and run it.
ubuntu@ip-10-0-1-10:~/django.nv$ docker login gitlab.local:4567 ## root/vagrant@123
ubuntu@DevSecOps-Box:~/django.nv$ ​docker tag django.nv:1.0 \
                                 gitlab.local:4567/root/django.nv:1.0
ubuntu@DevSecOps-Box:~/django.nv$ ​docker push gitlab.local:4567/root/django.nv:1.0
ubuntu@DevSecOps-Box:~/django.nv$ ​docker run -p 8000:8000 \
                                      gitlab.local:4567/root/django.nv:1.0 &
## go on visit ​http://10.0.1.10:8000/
## Clean up
```
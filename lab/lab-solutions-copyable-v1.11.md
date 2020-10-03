This file contains the exercise solutions for ease of copy/paste. 

Please refer the lab guide for more details.

Chapter 3: Secure SDLC and CI/CD pipeline
==================================================


## Exercise 3.1 Create a simple CI/CD pipeline

```
# This is how a comment is added to a yaml file, please read them carefully.

stages:
 - build   # this is build stage
 - test    # this is test stage
 - integration # this is an integration stage
 - prod       # this is prod/production stage

build:       # this is job named build, it can be anything, job1, job2, etc.,
  stage: build    # this job belongs to build stage, here both job and stage name is same i.e., build
  script:
    - echo "This is a build step"  # We are running an echo command but it can be any command.

test:
  stage: test
  script:
    - echo "This is a test step"
    - exit 1         # Non zero exit code, fails a job.

integration:        # integration job under stage integration.
  stage: integration 
  script:
    - echo "This is an integration step"

prod:
  stage: prod
  script:
    - echo "This is a deploy step"

```

## Exercise 3.2 Fail a job and allow it to be failed

```

stages:
 - build
 - test
 - integration
 - prod

build:
  stage: build
  script:
    - echo "This is a build step"
    - echo "some tool output" > output.txt # output of this command is stored in a file called output.txt
  artifacts:      # notice a new tag artifacts
    paths: [output.txt]   # this is the path to the output.txt file

test:
  stage: test
  script:
    - echo "This is a test step"
    # - exit 1

integration:
  stage: integration
  script:
    - echo "This is an integration step"
    - exit 1  # Fail a build with non-zero exit code
  allow_failure: true # Even if the job fails, continue to the next stages

prod:
  stage: prod
  script:
    - echo "This is a deploy step"
  when: manual # Continuous Delivery - human approval required
  
```

Chapter 4: Software Component Analysis (SCA) in CI/CD pipeline
==============================================================


## Exercise 4.1 Use Safety tool for scanning the third party vulnerable components.

```

stages:
 - build
 - test
 - integration
 - prod

build:
  stage: build
  script:
    - echo "This is a build step"
    - echo "some tool output" > output.txt
  artifacts:
    paths: [output.txt]

test:  # rename this to oast
  stage: test
  script:
    #- pip install safety --user
    #- safety check -r requirements.txt
    #- safety check -r requirements.txt --json | tee -a oast-results.json
    #- safety check -r requirements.txt --json > oast-results.json

    # We are going to pull the hysnsec/safety image to run the safety scanner
    - docker pull hysnsec/safety

    # third party components are stored in requirements.txt for python, so we will scan this particular file for safety.
    - docker run -v $(pwd):/src --rm hysnsec/safety safety check -r requirements.txt --json > oast-results.json
  artifacts:
    paths: [oast-results.json]
    when: always         # What does this do?
  allow_failure: true

integration:
  stage: integration
  script:
    - echo "This is an integration step"
    - exit 1
  allow_failure: true # Even if the job fails, continue to the next stages

prod:
  stage: prod
  script:
    - echo "This is a deploy step"
  when: manual # Continuous Delivery  
```

## Exercise 4.2 Use retirejs/npm@6 tool for scanning the third party vulnerable components.*

```
stages:
 - build
 - test
 - integration
 - prod

build:
  stage: build
  script:
    - echo "This is a build step"
    - echo "some tool output" > output.txt
  artifacts:
    paths: [output.txt]

oast:
  stage: test
  script:
    - docker pull hysnsec/safety
    - docker run -v $(pwd):/src --rm hysnsec/safety safety check -r requirements.txt --json > oast-results.json
  artifacts:
    paths: [oast-results.json]
    when: always
  allow_failure: true

# This job will fail because retirejs fails if it finds security issues.
oast-frontend:
  stage: test
  image: node:alpine3.10 # Notice we are using node image because retire js is a node package.
  script:
   - npm install -g retire # Install retirejs npm package.
   - npm install # We need to first install npm package present in package.json, npm install without a package name installs everything in package.json
   - retire --outputformat json --outputpath retirejs-report.json --severity high --exitwith 0     # Run the retirejs command, see its documentation
  artifacts:
    paths: [retirejs-report.json]
    when: always         # What does this do?
    expire_in: one week
  allow_failure: true
  tags:
    - docker # We only want this job to run inside a docker container because we don't have node/npm installed on our gitlab-runner machine by default. Since we are running inside the npm container, npm will be available for us to install retirejs

integration:
  stage: integration
  script:
    - echo "This is an integration step"
    - exit 1
  allow_failure: true # Even if the job fails, continue to the next stages

prod:
  stage: prod
  script:
    - echo "This is a deploy step"
  when: manual # Continuous Delivery
  
  ```


## Paid OAST Tool Exercise:  Use Snyk to scan code for Third party vulns.


```

stages:
 - build
 - test
 - integration
 - prod

build:
  stage: build
  script:
    - echo "This is a build step"
    - echo "some tool output" > output.txt
  artifacts:
    paths: [output.txt]


# For any SCA tool to work, it needs dependency files requirements.txt for python, gemfile for ruby, package.json for npm/javascript, ant.xml, maven.xml for Java. Also paid tools install dependencies to find the exact version used after the component installation.
oast-snyk:
 stage: build
 script:
  - virtualenv env  # Create virtual environment for python dependencies
  - source env/bin/activate  # Activate the virtual environment
  - pip install -r requirements.txt # Install third party components
  - rm package.json # remove package.json as we don't want to scan npm packages using this tool. If we don't remove it, snyk will scan for package.json
  # Download snyk binary from the github.
  - wget https://github.com/snyk/snyk/releases/download/v1.204.0/snyk-linux

  # rename snyk-linux to snyk for ease and give it executable permissions.
  - mv snyk-linux snyk && chmod +x snyk

  # Run the snyk scanner and store results in a json file.
  - ./snyk test --json  > snyk-results.json
 artifacts:
   when: always
   paths:
   - snyk-results.json
   expire_in: one week
 allow_failure: true

prod:
  stage: prod
  script:
    - echo "This is a deploy step"
  when: manual # Continuous Delivery
  
```

Chapter 5: SAST (Static Analysis) in CI/CD pipeline
==================================================


## Exercise 5.1 Use bandit tool to do SAST for django.nv


```
stages:
 - build
 - test
 - integration
 - prod

build:
  stage: build
  script:
    - echo "This is a build step"
    - echo "some tool output" > output.txt
  artifacts:
    paths: [output.txt]

sast:
  stage: build
  script:
   # Download bandit docker container
   - docker pull secfigo/bandit
   # - docker run --user $(id -u):$(id -g) -v $(pwd):/src --rm secfigo/bandit bandit -r /src
   # Run docker container, please refer docker security course, if this doesn't make sense to you.
   - docker run --user $(id -u):$(id -g) -v $(pwd):/src --rm secfigo/bandit bandit -r /src -f json -o /src/bandit-output.json
  artifacts:
    paths: [bandit-output.json]
    # when: on_failure
    when: always
  allow_failure: true

oast:
  stage: test
  script:
    - docker pull hysnsec/safety
    - docker run -v $(pwd):/src --rm hysnsec/safety safety check -r requirements.txt --json > oast-results.json
  artifacts:
    paths: [oast-results.json]
    when: always
  allow_failure: true

integration:
  stage: integration
  script:
    - echo "This is an integration step"
    - exit 1
  allow_failure: true # Even if the job fails, continue to the next stages

prod:
  stage: prod
  script:
    - echo "This is a deploy step"
  when: manual # Continuous Delivery
  
  ```

## Exercise 5.2 Use Trufflehog tool to scan for secrets

```
stages:
 - build
 - test
 - integration
 - prod

build:
  stage: build
  script:
    - echo "This is a build step"
    - echo "some tool output" > output.txt
  artifacts:
    paths: [output.txt]

sast:
  stage: build
  script:
   - docker pull secfigo/bandit
   - docker run --user $(id -u):$(id -g) -v $(pwd):/src --rm secfigo/bandit bandit -r /src -f json -o /src/bandit-output.json
  artifacts:
    paths: [bandit-output.json]
    # when: on_failure
    when: always
  allow_failure: true

git-secrets:
   stage: build
   script:
    - docker pull secfigo/trufflehog
    # - docker run --user $(id -u):$(id -g) -v $(pwd):/src --rm secfigo/trufflehog trufflehog --fail_code yes file:///src
    - docker run --user $(id -u):$(id -g) -v $(pwd):/src --rm secfigo/trufflehog trufflehog file:///src

   allow_failure: true

oast:
  stage: test
  script:
    - docker pull hysnsec/safety
    - docker run -v $(pwd):/src --rm hysnsec/safety safety check -r requirements.txt --json > oast-results.json
  artifacts:
    paths: [oast-results.json]
    when: always
  allow_failure: true

integration:
  stage: integration
  script:
    - echo "This is an integration step"
    - exit 1
  allow_failure: true # Even if the job fails, continue to the next stages

prod:
  stage: prod
  script:
    - echo "This is a deploy step"
  when: manual # Continuous Delivery
  
```

Chapter 6: DAST (Dynamic Analysis) in CI/CD pipeline
==================================================


## Exercise 6.0: A DevOps Pipeline for django.nv - DAST pre-requisite, must do


```
stages:
 - build
 - test
 - release           # new release stage
 - artefact_scanning # new artefact_scanning stage
 - preprod           # new preprod/staging stage
 - integration
 - prod

# Please ignore the following four jobs as we will be assuming, this is already being done by your DevOps team, we are only interested in integrating security in the jobs.
build:
  stage: build
  script:
   - virtualenv env
   - source env/bin/activate
   - pip install -r requirements.txt
   - python manage.py check

test:
  stage: test
  script:
   - virtualenv env
   - source env/bin/activate
   - pip install -r requirements.txt
   - python manage.py test taskManager

release: 
  stage: release # release stage and it has a release job.
  
  before_script:      # before_script is used for documentation, you can also put it under script:.
    - docker version  # Checking docker version for debugging.
    - docker info     # Checking docker info for debugging.
    # In order to build and store the docker image(artefact) in our docker registry, we need to login first hence the docker login command.
    #- docker login -u root -p vagrant@123 gitlab.local:4567
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" gitlab.local:4567
    #- docker login -u gitlab-ci-token -p $CI_BUILD_TOKEN $CI_REGISTRY
  
  script:
    # Build the django.nv container image. Any word which starts with $ is a variable stored under CI/CD variables.
    - docker build -t ${CI_REGISTRY}/root/django.nv:latest --pull .

    # Push the django.nv container image to docker registry.
    - docker push ${CI_REGISTRY}/root/django.nv:latest
    
  # after_script is used to clean up the artefacts and remove any files created in before_script and script. Commands under after_script run even if jobs fail.
  after_script:
    - docker logout ${CI_REGISTRY}
    - docker rmi ${CI_REGISTRY}/root/django.nv:latest
    

# This is a stage/preprod deployment job.
preprod:
  stage: preprod
  image: kroniak/ssh-client # Using ssh client image as we need to use ssh to login into staging/production machine
  only:
    - "master"
  environment: staging   # Calling this environment as staging
  tags:
    - docker           # Running this job only on docker runner 

  # The following commands are helping you setup passwordless between gitlab runner and staging environment. See Infrastructure as code chapter to learn more.
  before_script:
    - mkdir -p ~/.ssh
    - echo "$DEPLOY_USER_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_rsa
    - chmod 600 ~/.ssh/id_rsa
    - eval "$(ssh-agent -s)"
    - ssh-add ~/.ssh/id_rsa
    - ssh-keyscan -H $STAGING_PROD_SERVER_IP >> ~/.ssh/known_hosts

  # Deploying it to the staging machine(for us both staging/prod are the same).
  script:
    - ssh $DEPLOY_USER_NAME@$STAGING_PROD_SERVER_IP "docker login -u ${CI_REGISTRY_USER} -p ${CI_REGISTRY_PASSWORD} ${CI_REGISTRY}; docker stop app || true; docker rm app || true; docker pull ${CI_REGISTRY}/root/django.nv:latest; docker run -d  -p8000:8000 --name app -d ${CI_REGISTRY}/root/django.nv:latest"

```

## Exercise 6.1 Run Nikto to find common misconfigurations on web servers

```
stages:
 - build
 - test
 - release
 - artefact_scanning 
 - preprod
 - integration
 - prod

release:
  stage: release
  before_script:
    - docker version
    - docker info
    #- docker login -u root -p vagrant@123 gitlab.local:4567
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" gitlab.local:4567
    #- docker login -u gitlab-ci-token -p $CI_BUILD_TOKEN $CI_REGISTRY
  script:
    - docker build -t ${CI_REGISTRY}/root/django.nv:latest --pull .
    - docker push ${CI_REGISTRY}/root/django.nv:latest
  after_script:
    - docker logout ${CI_REGISTRY}
    # Remove the django.nv:latest image to save space and to clean up
    - docker rmi ${CI_REGISTRY}/root/django.nv:latest

# This is a stage/preprod deployment job.
preprod:
  stage: preprod
  image: kroniak/ssh-client # Using ssh client image as we need to use ssh to login into staging/production machine
  only:
    - "master"
  environment: staging   # Calling this environment as staging
  tags:
    - docker           # Running this job only on docker runner 

  # The following commands are helping you setup passwordless between gitlab runner and staging environment. See Infrastructure as code chapter to learn more.
  before_script:
    - mkdir -p ~/.ssh
    - echo "$DEPLOY_USER_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_rsa
    - chmod 600 ~/.ssh/id_rsa
    - eval "$(ssh-agent -s)"
    - ssh-add ~/.ssh/id_rsa
    - ssh-keyscan -H $STAGING_PROD_SERVER_IP >> ~/.ssh/known_hosts

  # Deploying it to the staging machine(for us both staging/prod are the same).
  script:
    - ssh $DEPLOY_USER_NAME@$STAGING_PROD_SERVER_IP "docker login -u ${CI_REGISTRY_USER} -p ${CI_REGISTRY_PASSWORD} ${CI_REGISTRY}; docker stop app || true; docker rm app || true; docker pull ${CI_REGISTRY}/root/django.nv:latest; docker run -d  -p8000:8000 --name app -d ${CI_REGISTRY}/root/django.nv:latest"

# Nikto's wiki page is available at https://github.com/sullo/nikto
nikto:
  stage: integration
  script:
    - docker run --rm -v $(pwd):/tmp sullo/nikto -h http://10.0.1.10:8000 -o /tmp/nikto-output.xml
  allow_failure: true
```

```
stages:
 - build
 - test
 - release
 - artefact_scanning 
 - preprod
 - integration
 - prod

release:
  stage: release
  before_script:
    - docker version
    - docker info
    #- docker login -u root -p vagrant@123 gitlab.local:4567
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" gitlab.local:4567
    #- docker login -u gitlab-ci-token -p $CI_BUILD_TOKEN $CI_REGISTRY
  script:
    - docker build -t ${CI_REGISTRY}/root/django.nv:latest --pull .
    - docker push ${CI_REGISTRY}/root/django.nv:latest
  after_script:
    - docker logout ${CI_REGISTRY}
    # Remove the django.nv:latest image to save space and to clean up
    - docker rmi ${CI_REGISTRY}/root/django.nv:latest

# This is a stage/preprod deployment job.
preprod:
  stage: preprod
  image: kroniak/ssh-client # Using ssh client image as we need to use ssh to login into staging/production machine
  only:
    - "master"
  environment: staging   # Calling this environment as staging
  tags:
    - docker           # Running this job only on docker runner 

  # The following commands are helping you setup passwordless between gitlab runner and staging environment. See Infrastructure as code chapter to learn more.
  before_script:
    - mkdir -p ~/.ssh
    - echo "$DEPLOY_USER_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_rsa
    - chmod 600 ~/.ssh/id_rsa
    - eval "$(ssh-agent -s)"
    - ssh-add ~/.ssh/id_rsa
    - ssh-keyscan -H $STAGING_PROD_SERVER_IP >> ~/.ssh/known_hosts

  # Deploying it to the staging machine(for us both staging/prod are the same).
  script:
    - ssh $DEPLOY_USER_NAME@$STAGING_PROD_SERVER_IP "docker login -u ${CI_REGISTRY_USER} -p ${CI_REGISTRY_PASSWORD} ${CI_REGISTRY}; docker stop app || true; docker rm app || true; docker pull ${CI_REGISTRY}/root/django.nv:latest; docker run -d  -p8000:8000 --name app -d ${CI_REGISTRY}/root/django.nv:latest"

# Nikto's wiki page is available at https://github.com/sullo/nikto
nikto:
  stage: integration
  script:
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" gitlab.local:4567
    - docker pull gitlab.local:4567/root/django.nv/nikto:latest
    - docker run --rm -v $(pwd):/tmp gitlab.local:4567/root/django.nv/nikto:latest -h http://10.0.1.22:8000 -o /tmp/nikto-output.xml
  allow_failure: true
  artifacts:
    paths: [nikto-output.xml]
    when: always
```
## Exercise 6.2/6.3 Sslyze and Nmap tools for dynamic analysis.


```
stages:
 - build
 - test
 - release
 - artefact_scanning 
 - preprod
 - integration
 - prod

release:
  stage: release
  before_script:
    - docker version
    - docker info
    #- docker login -u root -p vagrant@123 gitlab.local:4567
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" gitlab.local:4567
    #- docker login -u gitlab-ci-token -p $CI_BUILD_TOKEN $CI_REGISTRY
  script:
    - docker build -t ${CI_REGISTRY}/root/django.nv:latest --pull .
    - docker push ${CI_REGISTRY}/root/django.nv:latest
  after_script:
    - docker logout ${CI_REGISTRY}
    # Remove the django.nv:latest image to save space and to clean up
    - docker rmi ${CI_REGISTRY}/root/django.nv:latest

# This is a stage/preprod deployment job.
preprod:
  stage: preprod
  image: kroniak/ssh-client # Using ssh client image as we need to use ssh to login into staging/production machine
  only:
    - "master"
  environment: staging   # Calling this environment as staging
  tags:
    - docker           # Running this job only on docker runner 

  # The following commands are helping you setup passwordless between gitlab runner and staging environment. See Infrastructure as code chapter to learn more.
  before_script:
    - mkdir -p ~/.ssh
    - echo "$DEPLOY_USER_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_rsa
    - chmod 600 ~/.ssh/id_rsa
    - eval "$(ssh-agent -s)"
    - ssh-add ~/.ssh/id_rsa
    - ssh-keyscan -H $STAGING_PROD_SERVER_IP >> ~/.ssh/known_hosts

  # Deploying it to the staging machine(for us both staging/prod are the same).
  script:
    - ssh $DEPLOY_USER_NAME@$STAGING_PROD_SERVER_IP "docker login -u ${CI_REGISTRY_USER} -p ${CI_REGISTRY_PASSWORD} ${CI_REGISTRY}; docker stop app || true; docker rm app || true; docker pull ${CI_REGISTRY}/root/django.nv:latest; docker run -d  -p8000:8000 --name app -d ${CI_REGISTRY}/root/django.nv:latest"

nikto:
  stage: integration
  script:
    - docker pull secfigo/nikto:latest
    # - docker run --rm -v $(pwd):/report -i secfigo/nikto:latest -h demo.testfire.net
    - docker run --user $(id -u):$(id -g) --rm -v $(pwd):/report -i secfigo/nikto:latest -h 10.0.1.22 -output /report/nikto-output.xml
  artifacts:
    paths: [nikto-output.xml]
    when: always

sslscan:
 stage: integration
 script:
  # - pip install sslyze==1.4.2
  # sslyze is already installed by the practical devsecops team on the gitlab-runner machine.
  - sslyze --regular 10.0.1.22:443 --json_out sslyze-output.json
 artifacts:
    paths: [sslyze-output.json]
    when: always
 allow_failure: true

nmap:
 stage: integration
 script:
   # nmap is already installed by the practical devsecops team on the gitlab-runner machine.
   - nmap 10.0.1.22 -oX nmap.xml
   # - nmap -sV -sC 10.0.1.22
 artifacts:
    paths: [nmap.xml]
    when: always
 allow_failure: true
 ```


## Exercise 6.4 Use ZAP for dynamic analysis*

```
zap-baseline:
  stage: integration
  script:
   - docker run -t --rm owasp/zap2docker-stable zap-baseline.py -t http://10.0.1.22:8000/
   # - docker run -t owasp/zap2docker-stable zap-baseline.py -j -t https://10.0.1.22/
  after_script:
   # Clean up to save disk space
   - docker rmi owasp/zap2docker-stable 
  allow_failure: true
```

Chapter 7: Infrastructure as Code and Its Security
==================================================

## Exercise 0.1: A simple apt module demo.


```
---
- name: Example playbook to install nginx
  hosts: devsecops
  remote_user: ubuntu
  become: yes
  gather_facts: no
  vars:
    state: present

  tasks:
  - name: ensure Nginx is at the latest version
    apt:
      name: nginx
      state: "{{ state }}"
      update_cache: yes
```

## Exercise 7.1: Create playbook with roles from ansible-galaxy*


```
---
- name: Example playbook to install terraform using ansible role.
  hosts: devsecops
  remote_user: ubuntu
  become: yes

  roles:
    - secfigo.terraform
```

## Exercise 7.2: Using Ansible to Harden ubuntu server*

```
---
- name: Playbook to harden ubuntu OS.
  hosts: prod
  remote_user: ubuntu
  become: yes
  
  roles:
    - dev-sec.os-hardening
```

Ansible Hardening in CI/CD

```
stages:
 - build
 - test
 - release
 - artefact_scanning 
 - preprod
 - integration
 - prod


# Need to set up passwordless login for this to work and PROD_SERVER_UBUNTU_PRIVATE_KEY under CI/CD variables, i.e., ssh ubuntu@10.0.1.22 and cat ~/.ssh/id_rsa
ansible-hardening:
  stage: prod
  image: williamyeh/ansible:alpine3
  only:
    - "master"
  environment: production
  tags:
    - docker
  before_script: # Setting up passwordless login
    # To setup passwordless ssh auth, we need two things
    # 1. the SSH private key
    # 2. Some way to provide this key to ssh when it asks for authentication information
    # This is usually done by Ops, you don't need to know this in and out. There is some mechanism to login into a remote machine and run commands there.  

    # To store the key on this docker image, we are creating .ssh directory
    - mkdir -p ~/.ssh

    # Read the PROD_SERVER_UBUNTU_PRIVATE_KEY from the variables and copying it to ~/.ssh/id_rsa file
    - echo "$PROD_SERVER_UBUNTU_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_rsa

    # Changing permissions of this file to read-only, otherwise ssh will complain about loose permissions
    - chmod 600 ~/.ssh/id_rsa

    # Here we are using some bash magic to run the SSH agent in the background
    - eval "$(ssh-agent -s)"

    # Add this key to the agent
    - ssh-add ~/.ssh/id_rsa

    # To avoid the yes/no key fingerprint prompt, we are using keyscan tool to push the fingerprint into known_hosts file, this is the default location for storing fingerprints.
    - ssh-keyscan -H $STAGING_PROD_SERVER_IP >> ~/.ssh/known_hosts
  script:

    # To use ansible playbook, we need three things
    # 1. The SSH authentication, we already set this up in the above steps.
    # 2. The Inventory file
    # 3. The ansible playbook itself.

    # Set up the Inventory file using STAGING_PROD_SERVER_IP variable from CI/CD variables.
    - echo "[prod]" >> inventory.ini
    - echo "$STAGING_PROD_SERVER_IP" >> inventory.ini

    # Download the hardening ansible role.
    - ansible-galaxy install dev-sec.os-hardening

    # Run the playbook using the inventory.ini file we created and hardening playbook.
    - ansible-playbook -i inventory.ini ansible-hardening.yml

```

## Exercise 8.1/8.2 Using Ansible/Inspec to achieve compliance.


```
stages:
 - build
 - test
 - release
 - artefact_scanning 
 - preprod
 - integration
 - prod
# We need to set up passwordless login for this to work and PROD_SERVER_UBUNTU_PRIVATE_KEY under variables, i.e., ssh ubuntu@10.0.1.22 and cat ~/.ssh/id_rsa
ansible-hardening:
  stage: prod
  image: williamyeh/ansible:alpine3
  only:
    - "master"
  environment: production
  tags:
    - docker
  before_script:
    - mkdir -p ~/.ssh
    - echo "$PROD_SERVER_UBUNTU_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_rsa
    - chmod 600 ~/.ssh/id_rsa
    - eval "$(ssh-agent -s)"
    - ssh-add ~/.ssh/id_rsa
    - ssh-keyscan -H $STAGING_PROD_SERVER_IP >> ~/.ssh/known_hosts
  script:
    - echo "[prod]" >> inventory.ini
    - echo "$STAGING_PROD_SERVER_IP" >> inventory.ini
    - ansible-galaxy install dev-sec.os-hardening
    - ansible-playbook -i inventory.ini ansible-hardening.yml

inspec:
 stage: prod
 image: ubuntu:xenial
 only:
   - "master"
 environment: production
 tags:
   - docker
 before_script:
   - apt-get update
   - apt-get install wget openssh-server -y
   - wget https://packages.chef.io/files/stable/inspec/4.18.114/ubuntu/16.04/inspec_4.18.114-1_amd64.deb
   - dpkg -i inspec_4.18.114-1_amd64.deb
   - mkdir -p ~/.ssh
   - echo "$DEPLOY_USER_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_rsa
   - chmod 600 ~/.ssh/id_rsa
   - eval "$(ssh-agent -s)"
   - ssh-add ~/.ssh/id_rsa
   - ssh-keyscan -H $STAGING_PROD_SERVER_IP >> ~/.ssh/known_hosts
 script:
   - inspec exec https://github.com/dev-sec/linux-baseline -t ssh://deploy_user@10.0.1.22 -i ~/.ssh/id_rsa --chef-license accept
```

## Exercise 8.3 Create an InSpec profile for ubuntu


```
stages:
 - build
 - test
 - release
 - artefact_scanning 
 - preprod
 - integration
 - prod
# We need to set up passwordless login for this to work and PROD_SERVER_UBUNTU_PRIVATE_KEY under variables, i.e., ssh ubuntu@10.0.1.22 and cat ~/.ssh/id_rsa
ansible-hardening:
  stage: prod
  image: williamyeh/ansible:alpine3
  only:
    - "master"
  environment: production
  tags:
    - docker
  before_script:
    - mkdir -p ~/.ssh
    - echo "$PROD_SERVER_UBUNTU_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_rsa
    - chmod 600 ~/.ssh/id_rsa
    - eval "$(ssh-agent -s)"
    - ssh-add ~/.ssh/id_rsa
    - ssh-keyscan -H $STAGING_PROD_SERVER_IP >> ~/.ssh/known_hosts
  script:
    - echo "[prod]" >> inventory.ini
    - echo "$STAGING_PROD_SERVER_IP" >> inventory.ini
    - ansible-galaxy install dev-sec.os-hardening
    - ansible-playbook -i inventory.ini ansible-hardening.yml

inspec:
 stage: prod
 image: ubuntu:xenial
 only:
   - "master"
 environment: production
 tags:
   - docker
 before_script:
   - apt-get update
   - apt-get install wget openssh-server -y
   - wget https://packages.chef.io/files/stable/inspec/4.18.114/ubuntu/16.04/inspec_4.18.114-1_amd64.deb
   - dpkg -i inspec_4.18.114-1_amd64.deb
   - mkdir -p ~/.ssh
   - echo "$DEPLOY_USER_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_rsa
   - chmod 600 ~/.ssh/id_rsa
   - eval "$(ssh-agent -s)"
   - ssh-add ~/.ssh/id_rsa
   - ssh-keyscan -H $STAGING_PROD_SERVER_IP >> ~/.ssh/known_hosts
 script:
   - inspec exec inspec-profile/ubuntu -t ssh://deploy_user@10.0.1.22 -i ~/.ssh/id_rsa --chef-license accept
```

## Exercise 9.1: Upload ZAP results to Defect Dojo manually.

#### upload-results.py


```
import argparse
from datetime import datetime
import json
import os
import requests

def upload_results(host, user, api_key, scanner, result_file, engagement_id, verify=False): # set verify to False if ssl cert is self-signed
    API_URL = "http://"+host+"/api/v1"
    IMPORT_SCAN_URL = API_URL+ "/importscan/"
    AUTH_TOKEN = "ApiKey " + user + ":" + api_key

    headers = dict()
    json = dict()
    files = dict()

    # Prepare headers
    # headers = {'Authorization': 'ApiKey dojo:3e24a3ee5af0305af20a5e6224052de3ed2f6859'}
    headers['Authorization'] = AUTH_TOKEN
    print headers

    # Prepare JSON data to send to API
    # json= {
    #   "minimum_severity": "Low",
    #   "scan_date": datetime.now().strftime("%Y-%m-%d"),
    #   "verified": False,
    #   "tags": "",
    #   "active": False,
    #   "engagement": "/api/v1/engagements/2/",
    #   "lead":"/api/v1/users/1/",
    #   "scan_type": "Bandit Scan"
    # }
    json['minimum_severity'] = "Low"
    json['scan_date'] = datetime.now().strftime("%Y-%m-%d")
    json['verified'] = False
    json['tags'] = ""
    json['active'] = False
    json['engagement'] = "/api/v1/engagements/"+ engagement_id + "/"
    json['lead'] ="/api/v1/users/"+ "1" + "/"
    json['scan_type'] = scanner
    print json

    # Prepare file data to send to API
    files['file'] = open(result_file)

    # Make a request to API
    response = requests.post(IMPORT_SCAN_URL, headers=headers, files=files, data=json, verify=verify)
    # print r.request.body
    # print r.request.headers
    # print r.status_code
    # print r.text
    return response.status_code


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='CI/CD integration for DefectDojo')
    parser.add_argument('--host', help="DefectDojo Hostname", required=True)
    parser.add_argument('--api_key', help="API Key", required=True)
    parser.add_argument('--username', help="Username of Defect dojo user", required=True)
    parser.add_argument('--engagement_id', help="Engagement ID (optional)", required=True)
    parser.add_argument('--result_file', help="Scanner file", required=True)
    parser.add_argument('--scanner', help="Type of scanner", required=True)
    parser.add_argument('--product_id', help="DefectDojo Product ID", required=False)
    parser.add_argument('--build_id', help="Reference to external build id", required=False)

    # Parse out arguments
    args = vars(parser.parse_args())
    host = args["host"]
    api_key = args["api_key"]
    user = args["username"]
    product_id = args["product_id"]
    result_file = args["result_file"]
    scanner = args["scanner"]
    engagement_id = args["engagement_id"]
    build_id = args["build_id"]

    # upload_results(self, host, user, api_key, scanner, result_file, engagement_id, verify=False): # set verify to False if ssl cert is self-signed
    result = upload_results(host, user, api_key, scanner, result_file, engagement_id)

    if result == 201 :
         print "Successfully uploaded the results to Defect Dojo"
    else:
         print "Something went wrong, please debug " + str(result)
         
```

## Exercise 9.2: Manage the findings in a fully automated pipeline

The following script is for bandit, change it to ZAP and put it in the pipeline.

```
stages:
 - build
 - test
 - release
 - artefact_scanning 
 - preprod
 - integration
 - prod
## Need to setup Defect Dojo before you execute this stage
sast:
  stage: build
  script:
    - docker pull secfigo/bandit
    - docker run --user $(id -u):$(id -g) -v $(pwd):/src --rm secfigo/bandit bandit -r /src -f json -o /src/bandit-output.json
  after_script:
    - python upload-results.py --host 10.0.1.20:8000 --api_key $DOJO_API_TOKEN --engagement_id 1 --result_file bandit-output.json  --username root --scanner "Bandit Scan"
  artifacts:
    paths: [bandit-output.json]
    when: always
  allow_failure: true
```


# Appendix:


## Demo (Do not execute in pipeline, use your host machine) : Using OWASP Dependency Checker to scan third party component vulnerabilities in Java Code Base.

#### run-depcheck.sh

``````
#!/bin/sh

DATA_DIRECTORY="$PWD/data"
REPORT_DIRECTORY="$PWD/reports"
WEBGOAT_DIRECTORY="$PWD/WebGoat-7.1"

if [ ! -d "$WEBGOAT_DIRECTORY" ]; then
    git clone https://github.com/hamhc/WebGoat-7.1.git
fi


if [ ! -d "$DATA_DIRECTORY" ]; then
    echo "Initially creating persistent directories"
    mkdir -p "$DATA_DIRECTORY"
    chmod -R 777 "$DATA_DIRECTORY"

    mkdir -p "$REPORT_DIRECTORY"
    chmod -R 777 "$REPORT_DIRECTORY"
fi

cd "$WEBGOAT_DIRECTORY/webgoat-container/"

# Make sure we are using the latest version
docker pull owasp/dependency-check

# mvn install -Dmaven.test.skip=true

docker run --rm \
    --volume $(pwd):/src \
    --volume "$DATA_DIRECTORY":/usr/share/dependency-check/data \
    --volume "$REPORT_DIRECTORY":/report \
    owasp/dependency-check \
    --scan /src \
    --format "CSV" \
    --project "Webgoat" \
    --failOnCVSS 8 \
    --out /report
    #--noupdate \
    # Use suppression like this: (/src == $pwd)
    # --suppression "/src/security/dependency-check-suppression.xml"
```

#### .gitlab-ci.yml

```
stages:
 - build
 - test
 - integration
 - prod

build:
  stage: build
  script:
    - echo "This is a build step"
    - echo "some tool output" > output.txt
  artifacts:
    paths: [output.txt]

oast:
  stage: test
  script:
    - docker pull hysnsec/safety
    - docker run -v $(pwd):/src hysnsec/safety safety check -r requirements.txt --json > oast-results.json
  artifacts:
    paths: [oast-results.json]
    when: always
  allow_failure: true

odc-backend:
  stage: test
  image: gitlab/dind:latest
  script:
   # Download openjdk container as we don't want to install java on runner
   - chmod +x ./run-depcheck.sh
   - ./run-depcheck.sh
  artifacts:
    paths:
    - [reports/dependency-check-report.csv]
    expire_in: one week
  allow_failure: true
  tags:
    - docker

integration:
  stage: integration
  script:
    - echo "This is an integration step"
    - exit 1
  allow_failure: true # Even if the job fails, continue to the next stages

prod:
  stage: prod
  script:
    - echo "This is a deploy step"
  when: manual # Continuous Delivery
  
```

#### Expected output
To see the results, you can visit https://10.0.1.15/root/django.nv/pipelines to see the results of the new pipeline.
The odc-backend job under test stage will show below output.

```bash
Initially creating persistent directories
Using default tag: latest
latest: Pulling from owasp/dependency-check
Digest: sha256:1f05680131f9b23cec865e679e192954bbfcb1d9a304d7ceecce7869e80ccadd
Status: Image is up to date for owasp/dependency-check:latest
[INFO] Checking for updates
[INFO] NVD CVE requires several updates; this could take a couple of minutes.
[INFO] Download Started for NVD CVE - 2003
[INFO] Download Started for NVD CVE - 2002
[INFO] Download Complete for NVD CVE - 2003  (3216 ms)
[INFO] Download Started for NVD CVE - 2004
[INFO] Processing Started for NVD CVE - 2003
[INFO] Processing Complete for NVD CVE - 2003  (2195 ms)
[INFO] Download Complete for NVD CVE - 2002  (5933 ms)
[INFO] Download Started for NVD CVE - 2005
[INFO] Processing Started for NVD CVE - 2002
[INFO] Download Complete for NVD CVE - 2004  (5138 ms)
[INFO] Download Started for NVD CVE - 2006
[INFO] Processing Started for NVD CVE - 2004
[INFO] Processing Complete for NVD CVE - 2002  (4007 ms)
[INFO] Download Complete for NVD CVE - 2005  (5215 ms)
[INFO] Download Started for NVD CVE - 2007
[INFO] Processing Started for NVD CVE - 2005
[INFO] Processing Complete for NVD CVE - 2004  (3176 ms)
[INFO] Processing Complete for NVD CVE - 2005  (2950 ms)
[INFO] Download Complete for NVD CVE - 2006  (7834 ms)
[INFO] Download Started for NVD CVE - 2008
[INFO] Processing Started for NVD CVE - 2006
[INFO] Download Complete for NVD CVE - 2007  (7362 ms)
[INFO] Processing Started for NVD CVE - 2007
[INFO] Download Started for NVD CVE - 2009
[INFO] Download Complete for NVD CVE - 2008  (6691 ms)
[INFO] Download Started for NVD CVE - 2010
[INFO] Processing Started for NVD CVE - 2008
[INFO] Processing Complete for NVD CVE - 2006  (7026 ms)
[INFO] Download Complete for NVD CVE - 2009  (8160 ms)
[INFO] Processing Started for NVD CVE - 2009
[INFO] Download Started for NVD CVE - 2011
[INFO] Processing Complete for NVD CVE - 2007  (9224 ms)
[INFO] Download Complete for NVD CVE - 2010  (7579 ms)
[INFO] Download Started for NVD CVE - 2012
[INFO] Processing Started for NVD CVE - 2010
[INFO] Processing Complete for NVD CVE - 2008  (13643 ms)
[INFO] Download Complete for NVD CVE - 2011  (10708 ms)
[INFO] Download Started for NVD CVE - 2013
[INFO] Processing Started for NVD CVE - 2011
[INFO] Download Complete for NVD CVE - 2012  (7798 ms)
[INFO] Processing Started for NVD CVE - 2012
[INFO] Download Started for NVD CVE - 2014
[INFO] Processing Complete for NVD CVE - 2009  (15076 ms)
[INFO] Download Complete for NVD CVE - 2013  (9020 ms)
[INFO] Processing Started for NVD CVE - 2013
[INFO] Download Started for NVD CVE - 2015
[INFO] Download Complete for NVD CVE - 2014  (9361 ms)
[INFO] Download Started for NVD CVE - 2016
[INFO] Download Complete for NVD CVE - 2015  (6609 ms)
[INFO] Download Started for NVD CVE - 2017
[INFO] Download Complete for NVD CVE - 2016  (9352 ms)
[INFO] Download Started for NVD CVE - 2018
[INFO] Download Complete for NVD CVE - 2017  (10387 ms)
[INFO] Download Started for NVD CVE - 2019
[INFO] Processing Complete for NVD CVE - 2010  (33480 ms)
[INFO] Processing Started for NVD CVE - 2014
[INFO] Download Complete for NVD CVE - 2018  (11908 ms)
[INFO] Download Complete for NVD CVE - 2019  (8781 ms)
[INFO] Processing Complete for NVD CVE - 2011  (68860 ms)
[INFO] Processing Started for NVD CVE - 2015
[INFO] Processing Complete for NVD CVE - 2012  (68299 ms)
[INFO] Processing Started for NVD CVE - 2016
[INFO] Processing Complete for NVD CVE - 2013  (66767 ms)
[INFO] Processing Started for NVD CVE - 2017
[INFO] Processing Complete for NVD CVE - 2014  (56439 ms)
[INFO] Processing Started for NVD CVE - 2018
[INFO] Processing Complete for NVD CVE - 2015  (20916 ms)
[INFO] Processing Started for NVD CVE - 2019
[INFO] Processing Complete for NVD CVE - 2016  (23946 ms)
[INFO] Processing Complete for NVD CVE - 2019  (9721 ms)
[INFO] Processing Complete for NVD CVE - 2017  (25481 ms)
[INFO] Processing Complete for NVD CVE - 2018  (20371 ms)
[INFO] Download Started for NVD CVE - Modified
[INFO] Download Complete for NVD CVE - Modified  (3419 ms)
[INFO] Processing Started for NVD CVE - Modified
[INFO] Processing Complete for NVD CVE - Modified  (1532 ms)
[INFO] Begin database maintenance
[INFO] End database maintenance (20919 ms)
[INFO] Begin database defrag
[INFO] End database defrag (7430 ms)
[INFO] Check for updates complete (198044 ms)
[INFO]

Dependency-Check is an open source tool performing a best effort analysis of 3rd party dependencies; false positives and false negatives may exist in the analysis performed by the tool. Use of the tool and the reporting provided constitutes acceptance for use in an AS IS condition, and there are NO warranties, implied or otherwise, with regard to the analysis or its use. Any use of the tool and the reporting provided is at the users risk. In no event shall the copyright holder or OWASP be held liable for any damages whatsoever arising out of or in connection with the use of this tool, the analysis performed, or the resulting report.


[INFO] Analysis Started
[INFO] Finished File Name Analyzer (0 seconds)
[INFO] Finished Dependency Merging Analyzer (0 seconds)
[INFO] Finished Version Filter Analyzer (0 seconds)
[INFO] Finished Hint Analyzer (0 seconds)
[INFO] Created CPE Index (1 seconds)
[INFO] Finished CPE Analyzer (1 seconds)
[INFO] Finished False Positive Analyzer (0 seconds)
[INFO] Finished NVD CVE Analyzer (0 seconds)
00:00  INFO: Vulnerability found: jquery below 1.12.0
00:00  INFO: Vulnerability found: jquery below 1.12.0
00:00  INFO: Vulnerability found: jquery below 3.4.0
00:00  INFO: Vulnerability found: bootstrap below 3.4.1
00:00  INFO: Vulnerability found: bootstrap below 3.4.0
00:00  INFO: Vulnerability found: bootstrap below 3.4.0
00:00  INFO: Vulnerability found: bootstrap below 3.4.0
00:00  INFO: Vulnerability found: jquery-ui-dialog below 1.12.0
[INFO] Finished RetireJS Analyzer (0 seconds)
[INFO] Finished Sonatype OSS Index Analyzer (1 seconds)
[INFO] Finished Vulnerability Suppression Analyzer (0 seconds)
[INFO] Finished Dependency Bundling Analyzer (0 seconds)
[INFO] Analysis Complete (4 seconds)
```

## Paid OAST Tool Demo: Use sourceclear to scan code for Third party vulns. Do not execute


```

stages:
 - build
 - test
 - release
 - artefact_scanning 
 - preprod
 - integration
 - prod

build:
  stage: build
  script:
    - echo "This is a build step"
    - echo "some tool output" > output.txt
  artifacts:
    paths: [output.txt]

oast:
  stage: test
  script:
    - docker pull hysnsec/safety
    - docker run -v $(pwd):/src hysnsec/safety safety check -r requirements.txt --json > oast-results.json
  artifacts:
    paths: [oast-results.json]
    when: always
  allow_failure: true

oast-commercial:
  stage: build
  script:
   - virtualenv env
   - source env/bin/activate
   - pip install -r requirements.txt
   - rm package.json
   - curl -sSL https://download.sourceclear.com/ci.sh | bash # you need to add below token with name SRCCLR_API_TOKEN to see OAST results.

integration:
  stage: integration
  script:
    - echo "This is an integration step"
    - exit 1
  allow_failure: true # Even if the job fails, continue to the next stages

prod:
  stage: prod
  script:
    - echo "This is a deploy step"
  when: manual # Continuous Delivery

```

## Bonus Exercise (Do not execute in pipeline, run on your host machine) : Use OWASP find security bugs/spotbugs to scan a Java app for vulnerabilities.

##### .gitlab-ci.yml 

```
stages:
 - build
 - test
 - release
 - artefact_scanning 
 - preprod
 - integration
 - prod

build:
  stage: build
  script:
    - echo "This is a build step"
    - echo "some tool output" > output.txt
  artifacts:
    paths: [output.txt]

sca:
  stage: build
  image: gitlab/dind:latest
  script:
   # Download openjdk container as we don't want to install java on runner
   - docker pull openjdk:8
   # Download webgoat, a java vulnerable app
   - wget https://github.com/WebGoat/WebGoat/releases/download/7.1/webgoat-container-7.1-exec.jar
   # Download find security bugs, a java static analyzer
   - wget https://github.com/find-sec-bugs/find-sec-bugs/releases/download/version-1.9.0/findsecbugs-cli-1.9.0.zip
   # Unzip the findsecbugs app.
   - unzip findsecbugs-cli-1.9.0.zip
   # Fix the line ending in the shell script.
   - sed -i -e 's/\r$//' findsecbugs.sh
   # Run the findsecbugs app inside the docker container.
   - docker run --rm -it -v "$PWD":/usr/src/myapp -w /usr/src/myapp -m 8g openjdk:8 /bin/bash -c "bash findsecbugs.sh -progress -html -output findsecbugs-report.html webgoat-container-7.1-exec.jar"
  artifacts:
    paths:
    - findsecbugs-report.html
    expire_in: one week
  allow_failure: true
  tags:
    - docker

oast:
  stage: test
  script:
    - docker pull hysnsec/safety
    - docker run -v $(pwd):/src hysnsec/safety safety check -r requirements.txt --json > oast-results.json
  artifacts:
    paths: [oast-results.json]
    when: always
  allow_failure: true

integration:
  stage: integration
  script:
    - echo "This is an integration step"
    - exit 1
  allow_failure: true # Even if the job fails, continue to the next stages

prod:
  stage: prod
  script:
    - echo "This is a deploy step"
  when: manual # Continuous Delivery
```

## Demo Use ZAP Full Active Scan for dynamic analysis*

ubuntu@DevSecOps-Box:~/django.nv/zapdocker$ nano Dockerfile

```bash
FROM owasp/zap2docker-weekly
USER root
ARG FIREFOX_VERSION=latest
RUN FIREFOX_DOWNLOAD_URL=$(if [ $FIREFOX_VERSION = "latest" ] || [ $FIREFOX_VERSION = "nightly-latest" ] || [ $FIREFOX_VERSION = "devedition-latest" ]; then echo "https://download.mozilla.org/?product=firefox-$FIREFOX_VERSION-ssl&os=linux64&lang=en-US"; else echo "https://download-installer.cdn.mozilla.net/pub/firefox/releases/$FIREFOX_VERSION/linux-x86_64/en-US/firefox-$FIREFOX_VERSION.tar.bz2"; fi) \
  && apt-get update -qqy \
  && apt-get -qqy --no-install-recommends install firefox \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/* \
  && wget --no-verbose -O /tmp/firefox.tar.bz2 $FIREFOX_DOWNLOAD_URL \
  && apt-get -y purge firefox \
  && rm -rf /opt/firefox \
  && tar -C /opt -xjf /tmp/firefox.tar.bz2 \
  && rm /tmp/firefox.tar.bz2 \
  && mv /opt/firefox /opt/firefox-$FIREFOX_VERSION \
  && ln -fs /opt/firefox-$FIREFOX_VERSION/firefox /usr/bin/firefox

# GeckoDriver
ARG GECKODRIVER_VERSION=latest
RUN GK_VERSION=$(if [ ${GECKODRIVER_VERSION:-latest} = "latest" ]; then echo $(wget -qO- "https://api.github.com/repos/mozilla/geckodriver/releases/latest" | grep '"tag_name":' | sed -E 's/.*"v([0-9.]+)".*/\1/'); else echo $GECKODRIVER_VERSION; fi) \
  && echo "Using GeckoDriver version: "$GK_VERSION \
  && wget --no-verbose -O /tmp/geckodriver.tar.gz https://github.com/mozilla/geckodriver/releases/download/v$GK_VERSION/geckodriver-v$GK_VERSION-linux64.tar.gz \
  && rm -rf /opt/geckodriver \
  && tar -C /opt -zxf /tmp/geckodriver.tar.gz \
  && rm /tmp/geckodriver.tar.gz \
  && mv /opt/geckodriver /opt/geckodriver-$GK_VERSION \
  && chmod 755 /opt/geckodriver-$GK_VERSION \
  && ln -fs /opt/geckodriver-$GK_VERSION /usr/bin/geckodriver

RUN apt-get update -qqy\
	&& apt-get install -qqy --no-install-recommends apt-utils python3 python3-pip \
	&& rm -rf /var/lib/apt/lists/* /var/cache/apt/* \
	&& mkdir /zapcode
    
USER zap

RUN pip3 install selenium python-owasp-zap-v2.4

CMD ["/zapcode/startzap.sh"]
```

`ubuntu@DevSecOps-Box:~/django.nv/zapdocker$ cat startzap.sh`


```bash
#!/bin/bash

#running the zap in the background
bash -c "zap.sh -daemon -host 0.0.0.0 -port 8080 -config api.disablekey=true -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true 2>&1 &" && sleep 5

#running the zap scan in the background
echo "************** Running ZAP python script********************"
python3 -u /zapcode/zap-scan.py
```

##### ubuntu@DevSecOps-Box:~/django.nv/zapdocker$ nano zap-scan.py

```
#!/usr/bin/env python3
import time

from pprint import pprint
from zapv2 import ZAPv2 as ZAP

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.proxy import Proxy, ProxyType

#Declarations
browser_proxy = "127.0.0.1"
browser_proxy_port = 8080
#zap_proxy =
target = "http://10.0.1.22:8000"
#apikey = 'changeme'


print("Started ZAP Scan")

#non API
zap = ZAP(proxies={'http': 'http://127.0.0.1:8080', 'https':'https://127.0.0.1:8080'})
#enable whtn APIkey is being used.
#zap = ZAPv2(apikey=apikey, proxies={'http': 'http://127.0.0.1:8080', 'https':'https://127.0.0.1:8080'})

##Selenium Section Start
#arguments for running firefox headless
options = Options()
options.add_argument("--headless")

#configure firefox proxy through FirefoxProfile, 1 for manual proxy, to redirect selenium traffic
# through a zap proxy.
profile = webdriver.FirefoxProfile()
profile.set_preference('network.proxy.type', 1)
profile.set_preference('network.proxy.http', browser_proxy)
profile.set_preference('network.proxy.http_port', browser_proxy_port)
profile.update_preferences()

#invoking firefox driver                                                                        	 
driver=webdriver.Firefox(firefox_profile=profile, firefox_options=options)

#the following selenium script is specifically written for the djangonv. Please modify it according to your website

print("Started Djangonv Selenium Script \n")

#signup
driver.get(target + '/taskManager/register/')

#enter the username, password, firstname,lastname etc.
driver.find_element_by_id("id_username").send_keys('user10')
driver.find_element_by_id('id_first_name').send_keys('user')
driver.find_element_by_id('id_last_name').send_keys('user')
driver.find_element_by_id('id_email').send_keys('user@user1.com')
driver.find_element_by_id("id_password").send_keys('user123')
submit=driver.find_element_by_css_selector('.btn.btn-danger').click()

#login
driver.get(target + '/taskManager/login/')
driver.find_element_by_id('username').send_keys('user10')
driver.find_element_by_name('password').send_keys('user123')
submit=driver.find_element_by_xpath("//button[@type='submit']")
submit.click()

#spider the URL's
driver.get(target + "/taskManager/dashboard/")
driver.get(target +"/taskManager/task_list/")
driver.get(target + "/taskManager/project_list/")
driver.get(target + "/taskManager/search/")

#editing some data for better scan results
driver.get(target + "/taskManager/profile/")
driver.find_element_by_name('first_name').send_keys('firstroot')
driver.find_element_by_name('last_name').send_keys('lastroot')
driver.find_element_by_xpath("//button[@type='submit']").click()

time.sleep(2)
driver.close()

print("Djangonv Selenium Spidering End")

## End of Selenium section

print('Accessing the target {}'.format(target))
zap.urlopen(target)
time.sleep(2)

print('Continuing the ZAP Spidering')
scanid = zap.spider.scan(target)
time.sleep(2)
while(int(zap.spider.status(scanid))<100):
	print('Spider progress %: {}'.format(zap.spider.status(scanid)))
	time.sleep(5)

print('Active Scanning started on target {}'.format(target))
scanid = zap.ascan.scan(target)
while(int(zap.ascan.status(scanid))<100):
	print(' Active scan is still %: {}'.format(zap.ascan.status(scanid)))
	time.sleep(10)

print ('Active Scan Completed')

print ('Hosts Scanned: {}'.format(', '.join(zap.core.hosts)))
print ('Writing ZAP Alerts: ')
print (zap.core.alerts())
print("ZAP Scan is successfully done.")
```

Can we put it in CI/CD, yes but do you want to put?  NO

```
zap_authenticated:
  stage: integration
  before_script:
    - docker login -u gitlab-ci-token -p $CI_BUILD_TOKEN $CI_REGISTRY
  script:
    - cd zapdocker
    - docker pull gitlab.local:4567/root/django.nv/zap2docker:latest
    - docker run --volume $(pwd):/zapcode gitlab.local:4567/root/django.nv/zap2docker:latest
```

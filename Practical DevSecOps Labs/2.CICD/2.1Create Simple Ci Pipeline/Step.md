
Gitlab URL: https://gitlab-ce-ujlxxadn.lab.practical-devsecops.training/root/django-nv/-/blob/master/.gitlab-ci.yml
username: root
password: pdso-training
```bash
# This is how a comment is added to a yaml file, please read them carefully.

stages:   # Dictionary
 - build   # this is build stage
 - test    # this is test stage
 - integration # this is an integration stage
 - prod       # this is prod/production stage

build:       # this is job named build, it can be anything, job1, job2, etc.,
  stage: build    # this job belongs to build stage, here both job name and stage name is same i.e., build
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

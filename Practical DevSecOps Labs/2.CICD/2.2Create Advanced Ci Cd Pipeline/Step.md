
Gitlab URL: https://gitlab-ce-htjxbscc.lab.practical-devsecops.training/root/django-nv/-/blob/master/.gitlab-ci.yml
username: root
password: pdso-training
```bash
# This is how a comment is added to a yaml file, please read them carefully.

stages:   # Dictionary
 - build   # this is build stage
 - test    # this is test stage
 - integration # this is an integration stage
 - prod       # this is prod/production stage

job1:       # this is job named build, it can be anything, job1, job2, etc.,
  stage: build    # this job belongs to build stage, here both job name and stage name is same i.e., build
  script:
    - echo "This is a build step"  # We are running an echo command but it can be any command.

job2:
  stage: test
  script:
    - echo "This is a test step"

job3:        # integration job under stage integration.
  stage: integration 
  script:
    - echo "This is an integration step"

job4:
  stage: prod
  script:
    - echo "This is a deploy step"
```

### Fail a build using exit code
```bash
# This is how a comment is added to a yaml file, please read them carefully.

stages:   # Dictionary
 - build   # this is build stage
 - test    # this is test stage
 - integration # this is an integration stage
 - prod       # this is prod/production stage

job1:       # this is job named build, it can be anything, job1, job2, etc.,
  stage: build    # this job belongs to build stage, here both job name and stage name is same i.e., build
  script:
    - echo "This is a build step"  # We are running an echo command but it can be any command.

job2:
  stage: test
  script:
    - echo "This is a test step"
    #************ Non zero exit code, fails a job. ************ #
    - exit 1         

job3:        # integration job under stage integration.
  stage: integration 
  script:
    - echo "This is an integration step"

job4:
  stage: prod
  script:
    - echo "This is a deploy step"
```
## Allow the job failure
```bash
# This is how a comment is added to a yaml file, please read them carefully.

stages:   # Dictionary
 - build   # this is build stage
 - test    # this is test stage
 - integration # this is an integration stage
 - prod       # this is prod/production stage

job1:       # this is job named build, it can be anything, job1, job2, etc.,
  stage: build    # this job belongs to build stage, here both job name and stage name is same i.e., build
  script:
    - echo "This is a build step"  # We are running an echo command but it can be any command.

job2:
  stage: test
  script:
    - echo "This is a test step"
    - exit 1         # Non zero exit code, fails a job.
  allow_failure: true   #<--- allow the build to fail but don't mark it as such


job3:        # integration job under stage integration.
  stage: integration 
  script:
    - echo "This is an integration step"

job4:
  stage: prod
  script:
    - echo "This is a deploy step"
```

### Save scan results
```bash
# This is how a comment is added to a yaml file, please read them carefully.

stages:   # Dictionary
 - build   # this is build stage
 - test    # this is test stage
 - integration # this is an integration stage
 - prod       # this is prod/production stage

job1:       # this is job named build, it can be anything, job1, job2, etc.,
  stage: build    # this job belongs to build stage, here both job name and stage name is same i.e., build
  script:
    - echo "This is a build step"  # We are running an echo command but it can be any command.
    - echo '{vulnerability:"SQL Injection"}' > output.json
  artifacts:      # notice a new tag artifacts
    paths: [output.json]   # this is the path to the output.txt file

job2:
  stage: test
  script:
    - echo "This is a test step"
    - exit 1         # Non zero exit code, fails a job.
  allow_failure: true   #<--- allow the build to fail but don't mark it as such

job3:        # integration job under stage integration.
  stage: integration 
  script:
    - echo "This is an integration step"

job4:
  stage: prod
  script:
    - echo "This is a deploy step"
```

## Implement Continuous Delivery
```bash
# This is how a comment is added to a yaml file, please read them carefully.

stages:   # Dictionary
 - build   # this is build stage
 - test    # this is test stage
 - integration # this is an integration stage
 - prod       # this is prod/production stage

job1:       # this is job named build, it can be anything, job1, job2, etc.,
  stage: build    # this job belongs to build stage, here both job name and stage name is same i.e., build
  script:
    - echo "This is a build step"  # We are running an echo command but it can be any command.
    - echo '{vulnerability:"SQL Injection"}' > output.json
  artifacts:      # notice a new tag artifacts
    paths: [output.json]   # this is the path to the output.txt file

job2:
  stage: test
  script:
    - echo "This is a test step"
    - exit 1         # Non zero exit code, fails a job.
  allow_failure: true   #<--- allow the build to fail but don't mark it as such

job3:        # integration job under stage integration.
  stage: integration 
  script:
    - echo "This is an integration step"

job4:
  stage: prod
  script:
    - echo "This is a deploy step"
  when: manual   #<-- A human has to click a button (play button in Gitlab) for this task to 
```
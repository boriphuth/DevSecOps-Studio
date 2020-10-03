## Learn how to use retirejs to scan frontend components
```bash
## Download the source code
git clone https://github.com/secfigo/django.nv.git webapp
cd webapp

## Install RetireJS Tool https://github.com/retirejs/retire.js/
curl -sL https://deb.nodesource.com/setup_10.x | bash -
apt install nodejs -y
npm install -g retire
retire --help

## Run the Scanner
cat package.json
npm install

## DevSecOps Gospel
retire --outputformat json --outputpath retire_output.json
cat retire_output.json

## Exercise
Recall techniques you have learned in the previous module (Secure SDLC and CI/CD)

1.Explore various options provided by the retirejs tool.
2.Only fail the build when high severity issues are found in the results.
3.Mark a high severity issue as false positive.

```

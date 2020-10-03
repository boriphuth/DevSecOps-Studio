## Step 1 - Basic commands
```bash
mkdir my-directory
rmdir no-such-directory
pip3 install --quiet ansible ansible-lint
pip3 install --quiet ansible ansible-lint &
```
## Understanding Directories/Folders
```bash
mkdir folder
ls folder
cd folder
pwd
cd ..
rmdir folder
```
## Understanding Files
```bash
nano myfile
## Exit control + X
cat myfile
mv myfile newfile
ls
rm newfile
```
## A hack - create file using cat
```bash
cat > filename <<EOL

Some text content

EOL
```
## Intermediate Linux Commands
```bash
cat > myfile <<EOL
ls
EOL
cat myfile
chmod +x myfile
ls -l myfile
./myfile
```
## Understanding redirection in Linux
```bash
cat /etc/passwd > mypasswd.txt
cat mypasswd.txt
cat /etc/passwd >> mypasswd.txt ## You can also append to an existing file using >> characters.
cat mypasswd.txt
echo "this is a string"
echo $HOSTNAME
echo "this is a string" > file.txt
cat file.txt
```
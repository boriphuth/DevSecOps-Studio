### Step 1 - Basic commands
```bash
mkdir my-directory
rmdir no-such-directory
pip3 install --quiet ansible ansible-lint
pip3 install --quiet ansible ansible-lint & ##background
mkdir folder
ls folder
cd folder
pwd
cd ..
rmdir folder
nano myfile ## You can exit the editor using control + X
cat myfile
```
### You can exit the editor using control + X
```bash
cat > myfile <<EOL
ls
EOL
cat myfile
ls -l myfile
chmod +x myfile
ls -l myfile
./myfile

cat /etc/passwd > mypasswd.txt
cat mypasswd.txt
cat /etc/passwd >> mypasswd.txt
cat mypasswd.txt
echo "this is a string"
echo $HOSTNAME
echo "this is a string" > file.txt
cat file.txt
cat mypasswd.txt
cat mypasswd.txt | cut -d ':' -f 1
ls -l
echo $?
rmdir doesnt-exist-folder
echo $?

```
wss://portal.practical-devsecops.training/dockerssh/?&width=138&height=42
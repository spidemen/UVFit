

AWS Server IP: 18.222.203.101
key file: was.pem

Login: ssh -i was.pem ec2-user@18.222.203.101. (on the was.pem directory)

start data: ./mongod
Data Directory :  ../data

look up data: mongon

some command: show dbs;  show collections; db.$collections.find();

How to start server???
1. after log in AWS linux: install node 10
nvm install node 10
2. start db: ./mongod
3. start node: nodemon



node version: v10.12.0 above 10 is fine
npm: 6.4.1

Fold:
Controller: endpoint design (API), router webpage and send response
public: store js , css and picture etc, which is needed by HTML file.
views:  purge ejs(the same as html) file, just only just show webpage outlook.
Models: database scheme define and other database related function


//clones entire github ece513 repository
git clone <url>

//updates your local copy
git pull

//adds files to git staging area
git add <files>

//commits changes to your local checkout
git commit -m "my message"

//pushes to the cloud repository
git push

//git cheat sheet for anything else
https://www.git-tower.com/blog/git-cheat-sheet
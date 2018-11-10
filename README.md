

AWS Server IP: 18.222.203.101
key file: was.pem

Login: ssh -i was.pem ec2-user@18.222.203.101. (on the was.pem directory)

start data: ./mongod
Data Directory :  ../data

look up data: mongon

some command: show dbs;  show collections; db.$collections.find();


node version: v10.12.0 above 10 is fine
npm: 6.4.1

Fold:
Controller: endpoint design (API), router webpage and send response
public: store js , css and picture etc, which is needed by HTML file.
views:  purge ejs(the same as html) file, just only just show webpage outlook.
Models: database scheme define and other database related function

 
 

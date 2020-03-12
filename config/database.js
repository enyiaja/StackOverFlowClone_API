if(process.env.NODE_ENV == 'production'){
   module.exports = {mongoURI: 'mongodb://user:user101@ds131784.mlab.com:31784/vidjot-pro', accessTokenSecret: 'myaccesstokensecret'}
}
else{
   module.exports = {mongoURI: 'mongodb://localhost/stackoverflowclone', accessTokenSecret: 'myaccesstokensecret'}
}
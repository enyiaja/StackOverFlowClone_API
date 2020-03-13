if(process.env.NODE_ENV == 'production'){
   module.exports = {
      mongoURI: 'mongodb://dbUser:user12345@ds039447.mlab.com:39447/stackoverflowclone',
      accessTokenSecret: 'myaccesstokensecret'
   }
}
else{
   module.exports = {mongoURI: 'mongodb://localhost/stackoverflowclone', accessTokenSecret: 'myaccesstokensecret'}
}
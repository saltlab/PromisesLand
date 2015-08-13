function getUserDetails(user, cb){
    process.nextTick(
        function(user){cb(user);}
    );
};
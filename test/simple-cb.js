getUserDetails("mjackson", function (err, details) {
    console.log(details);
});

function getUserDetails(user, cb){
    process.nextTick(
        function(){cb('error',null);}
    );
};


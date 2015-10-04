/*Example taken from SO question:
 http://stackoverflow.com/questions/27275337/how-can-i-refactor-this-callback-hell-with-promises*/

FB.api(
    {
        method: 'fql.query',
        query: 'SELECT uid, name, is_app_user FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me()) AND is_app_user=1'
    },
    function (response) { // response contains a list of friends
        response.forEach(function (element) { // so for each friend
            FB.api(
                '/' + element.uid + '/friends',
                function (response) { // get a list of THEIR friends
                    console.log(response); // and output them
                }
            );
        });
    }
);

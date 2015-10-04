/*Example taken from SO question:
 http://stackoverflow.com/questions/27275337/how-can-i-refactor-this-callback-hell-with-promises*/

/*Promise Creation*/
function FB_api(options) {
    return new Promise(function (resolve, reject) {
        return FB.api(options, resolve);
    });
}


/*Promise Usage*/
FB_api({
    method: 'fql.query',
    query: 'SELECT uid, name, is_app_user FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me()) AND is_app_user=1'
}).then(function (response) { // response contains a list of friends
    response.forEach(function (element) { // so for each friend
        FB_api('/' + element.uid + '/friends').then(function (response) { // get a list of THEIR friends
            console.log(response); // and output them
        });
    });
});
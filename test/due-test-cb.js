var my_fn = require('./my-fn'),
    arg1 = 'A',
    arg2 = 'B';

my_fn(arg1, 
  function cont1(err, res) {
    my_fn(arg1 + ', ' + arg2,

      function cont2(err, res) {
        console.log(res);
      });
  });
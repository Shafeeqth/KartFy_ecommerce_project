
//facebook strategy ..

// passport.use( new facebookStrategy({

//     //pull in our app id and secret from our auth.js file
//     clientID  : '713572820983746',
//     clientSecret: '7e7872fea9df42b4038616502a7cc02e',
//     callbackURL: 'http:localhost:3000/facebook/callback',
//     profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email']


// },
// //facebook will set back the token and profile
// function(token, refreshToken, profile, done) {

// }));

// app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

// app.get('/facebook/callback', passport.authenticate('facebook', {
//     successRedirect: '/profile',
//     failureRedirect: '/failer',
// }));

// app.get('/profile', (req, res) => {
//     res.send('you are a valid user');
// })

// app.get('/failed', (req, res) => {
//     res.send('you are not valid')
// });

// passport.serializeUser( (user, done) => {
//     done(null, user);
// });

// passport.deserializeUser((id, done) => {

//     return done(null, id)
// })




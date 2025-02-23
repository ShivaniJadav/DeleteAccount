var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
const session = require('express-session');

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: 'delete_account_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use secure: true in production with HTTPS
  }));

// app.use(express.static(path.join(__dirname, "public")));

// app.use("/", indexRouter);
app.use("/users", usersRouter);

app.get('/', (req, res, next) => {
  res.redirect('/users/')
})

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error', {error: JSON.stringify(err)});
// });

module.exports = app;

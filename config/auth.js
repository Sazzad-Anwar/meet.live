//jshint esversion:10
module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please log in first'); 
      res.redirect('/admin');
    },
  
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      req.flash('warning_msg', 'Please log Out'); 
      res.redirect('/admin/dashboard');      
    },
  };
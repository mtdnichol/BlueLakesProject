const { lakeReportSchema, anglerReportSchema, userAccountSchema } = require('./schemas'); // JOI schema, not mongodb schema
const ExpressError = require('./utils/ExpressError');
const LakeHealthReport = require('./views/models/Lake_Health_Report');
const AnglerReport = require('./views/models/Angler_Report');

module.exports.isLoggedIn = (req, res, next) => { //Checks if the user is not logged in.  Used on pages the user must be logged in to view
    if (!req.isAuthenticated()) { //Checks if the user is currently NOT authenticated
        req.session.returnTo = req.originalUrl; // append link navigated from so we can send them back to that page once logged in
        req.flash('error', "You must be signed in first!"); //If they are not logged in, redirect to the login page
        return res.redirect('/login')
    }
    next();
};

module.exports.isCurrentlyAuthenticated = (req, res, next) => { //Checks if the user is logged in.  Used on pages the user must NOT be logged in to view (eg. register, login, forgotPassword, etc.)
    if (req.isAuthenticated()) { //Check if the user is currently authenticated
        req.flash('error', "You are already logged in!"); //If they are already logged in, redirect to the home page
        return res.redirect('/')
    }
    next();
};

module.exports.validateLakeReport = (req, res, next) => {
    const { error } = lakeReportSchema.validate(req.body);

    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',');
        throw new ExpressError(errorMessage, 400)
    } else {
        next();
    }
};

module.exports.validateAnglerReport = (req, res, next) => { //JOI server-side validation on form submission (schemas.js)
    const { error } = anglerReportSchema.validate(req.body);

    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',');
        throw new ExpressError(errorMessage, 400)
    } else {
        next();
    }
};

module.exports.validateUserAccount = (req, res, next) => {
    const { error } = userAccountSchema.validate(req.body);

    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',');
        throw new ExpressError(errorMessage, 400)
    } else {
        next();
    }
}

module.exports.isCreator = async (req, res, next) => { //Checks if a user is creator of an item they want to access
    const { id } = req.params; //Pulls the ID from the URL
    const lakeReport = await LakeHealthReport.findById(id); //Attempts to find an associated LakeHealthReport
    const anglerReport = await AnglerReport.findById(id); //Attempts to find an associated AnglerReport
    // if user is not authorized to update (same as creator), redirect and flash error
    if (lakeReport) //Checks if an angler report exists
        if (!(lakeReport.creator).equals(req.user._id)) { //Checks the requesting user id against the lake reports creator ID
            req.flash('error', "You do not have permission to do that");
            return res.redirect(`/lakeReports/${id}`);
        }
    if (anglerReport) //Checks if a lake health report exists
        if (!(anglerReport.creator).equals(req.user._id)) { //Checks the requesting user id against the angler reports creator ID
            req.flash('error', "You do not have permission to do that");
            return res.redirect(`/anglerReports/${id}`);
        }
    next();
};
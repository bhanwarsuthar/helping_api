function buildCrud(str, arr) {
    if (arr.length >= 1) {
        return arr.map(e => { return e + " " + str })
    }
}

const permissions = {
    admin: ["*"],
    editor: [].
        concat(
            buildCrud("category", ["create", "update", "view", "delete"]),
            buildCrud("product", ["create", "update", "view", "delete"]),
        ),
    customer: [].
        concat(
            buildCrud("category", ["create", "update", "view", "delete"]),
            buildCrud("product", ["create", "update", "view", "delete"]),
        ),
    seller: []
        .concat(
            "create product"
        ),
    analyst: [].concat(

    )
}

const can = function (permission) {
    var role = this.role;
    if (role && permissions[role]) {
        return permissions[role].includes(permission);
    }
    return false;
}
function allowedPermission(...param) {
    return (req, res, next) => {
        var role = req.user.role;
        if (role && permissions[role]) {
            if (param == "*") {
                return next();
            }
            else {
                for (i = 0; i < param.length; i++) {
                    if (!permissions[role].includes(param[i])) {
                        return res.status(403).json({ message: "Permission denied : "+ param[i] });
                    }
                }
                return next();
            }
        }
        return res.status(403).json({ message: "Permission denied." });
    }
}

function allowedRoles(...roles) {

    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Permission denied." });
        }
        next();
    }
}


module.exports = { permissions, can, allowedRoles, allowedPermission };
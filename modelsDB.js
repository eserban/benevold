function userSchema(firstName, lastName, email, password, role){
    return {
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "password": password,
        "dateRegistered": new Date().toISOString().slice(0, 16).replace('T', ' '),
        "role": role
    };
}

function jwtSignSchema(id, firstName, lastName, role){
    return {
        "id": id,
        "firstName": firstName,
        "lastName": lastName,
        "role": role
    }
}



module.exports = {
    userSchema,
    jwtSignSchema
}

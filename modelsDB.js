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

function userAdminSchema(email, password, role){
    return {
        "email": email,
        "password": password,
        "dateRegistered": new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
}

function jwtSignSchema(id, firstName, lastName, email, role){
    return {
        "id": id,
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "role": role
    }
}

function jwtAdminSignSchema(id, email){
    return {
        "id": id,
        "email": email
    }
}

function usersFindSchema(){
    return {
        "password": 0
    }
}



module.exports = {
    userSchema,
    userAdminSchema,
    jwtSignSchema,
    jwtAdminSignSchema,
    usersFindSchema
}

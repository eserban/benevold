function userSchema(user, password, role){
    return {
        "user": user,
        "password": password,
        "dateRegistered": new Date().toISOString().slice(0, 16).replace('T', ' '),
        "role": role
    };
}


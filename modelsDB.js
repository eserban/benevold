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

function jelloProjectsSchema(name, team, tasks) {
    return {
        "name": name,
        "team": team,
        "tasks": tasks
    }
}

function jelloTasksSchema(name, team, status, description, comments, projectId) {
    return {
        "name": name,
        "status": status,
        "team": team,
        "description": description,
        "comments": comments,
        "project_id": projectId,
    }
}

function categorieSchema(title) {
    return {
        "title": title
    }
}



module.exports = {
    userSchema,
    userAdminSchema,
    jwtSignSchema,
    jwtAdminSignSchema,
    usersFindSchema,
    jelloProjectsSchema,
    jelloTasksSchema,
    categorieSchema
}

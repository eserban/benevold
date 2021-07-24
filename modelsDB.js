function userAdminSchema(email, password, role){
    return {
        "email": email,
        "password": password,
        "dateRegistered": new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
}

function userSchema(username, email, phoneNumber, address, postalCode, city, password, type, picLink){
    return {
        "fullName": username,
        "email": email,
        "telNumber": phoneNumber,
        "adress": address,
        "postalCode": postalCode,
        "city": city,
        "createdAt": new Date().toISOString().slice(0, 16).replace('T', ' '),
        "password": password,
        "type": type,
        "picLink": picLink
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

function jwtUserSignSchema(id, email, type){
    return {
        "id": id,
        "email": email,
        "type": type
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

/**
 * const userId = req.body.user_id ?? null;
    const title = req.body.title ?? null;
    const category = req.body.category ?? null;
    const description = req.body.description ?? null;
    const phone = req.body.phone ?? null;
    const email = req.body.email ?? null;
    const contact = req.body.contact ?? null;
    const address = req.body.address ?? null;
    const date = req.body.date ?? null;
    const status = "en cours";
 */

function annonceSchema(userId, title, category, description, phone, email, contact, address, date, time) {
    return {
        "user_id": userId,
        "title": title,
        "category": category,
        "description": description,
        "phone": phone,
        "email": email,
        "contact": contact,
        "address": address,
        "date": date,
        "time": time,
        "status": "en cours"
    }
}



module.exports = {
    userAdminSchema,
    jwtSignSchema,
    jwtAdminSignSchema,
    usersFindSchema,
    jelloProjectsSchema,
    jelloTasksSchema,
    categorieSchema,
    jwtUserSignSchema,
    userSchema,
    annonceSchema
}

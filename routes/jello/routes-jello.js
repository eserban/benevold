var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userAdminSchema, jwtAdminSignSchema, usersFindSchema, jelloProjectsSchema, jelloTasksSchema, jelloTasksSchema } = require("../../modelsDB.js");
let router = express.Router();
let dbName = "benevold_db"

const MongoClient = require("mongodb").MongoClient;
const uri = process.env.MONGO_URI || "mongodb+srv://admin-benevold:MaqLBQjdNLmm6b4R@cluster0.qf07i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

(async () => {
    await client.connect();

    //Route pour Jello, pour retourner tous les utilisateurs
    router.get("/users", async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        let userEmail = null;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed"
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY || "testENCODE") ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            userEmail = tokenObject.email;
            const userCollection = await client.db(dbName).collection("jello_users");
            const projection = usersFindSchema();
            response = await userCollection.find().project(projection).toArray();
        }


        const data = {
            "account": userEmail,
            "success": success,
            "requestCode": code,
            "error": errorMessage,
            "response": response
        };

        res.status(code).send(data);
    });

    router.get("/projects", async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        let userEmail = null;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed"
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY || "testENCODE") ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            userEmail = tokenObject.email;
            const projectCollection = await client.db(dbName).collection("jello_projects");
            response = await projectCollection.find().toArray();
        }


        const data = {
            "account": userEmail,
            "success": success,
            "requestCode": code,
            "error": errorMessage,
            "response": response
        };

        res.status(code).send(data);
    });

    router.get("/test", async (req, res) => {
        res.status(200).send("All is good");
    });




    router.get("/auth", async (req, res) => {
        try {
            const username = req.body.email ?? null;
            const password = req.body.password ?? null;

            let time = req.query.time;

            let success = true;
            let code = 200;
            let errorMessage = null;
            let token = null;

            const userCollection = await client.db(dbName).collection("jello_users");
            const user = await userCollection.find({ "username": username }).limit(1).toArray();

            if (!password) {
                success = false;
                code = 400;
                errorMessage = "Un mot de passe est requis."
            } else if (!time) {
                success = false;
                code = 400;
                errorMessage = "Veuillez reinseigner le temps d'expiration du token."
            } else if (user.length < 1) {
                success = false;
                code = 404;
                errorMessage = "Ce nom d'utilisateur n'est associé à aucun compte";
            } else if (!bcrypt.compare(password, user[0].password)) {
                success = false;
                code = 400;
                errorMessage = "Le mot de passe est pas valide";
            }

            if (success) {
                //if body entries are OK we generate a token for the user
                let tokenSignSchema = jwtAdminSignSchema(user[0]._id, user[0].username);

                token = jwt.sign(tokenSignSchema, process.env.JWT_KEY || "testENCODE", {
                    expiresIn: 86400
                });
            }

            const data = {
                "success": success,
                "requestCode": code,
                "error": errorMessage,
                "token": token
            };

            res.status(code).send(data);
        } catch (err) {
            console.error(err);
        }
    });


    router.post('/project', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        let projectId = req.body.project_id;
        let name = req.body.name;
        let team = req.body.team;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        const projectCollection = await client.db(dbName).collection("jello_projects");
        const project = await projectCollection.find({ "project_id": projectId }).toArray();


        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed"
        } else if (!projectId || !name) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner toutes les informations relatives au project"
        } else if (project.length > 0) {
            success = false;
            code = 400;
            errorMessage = "Ce project existe deja";
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY || "testENCODE") ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            await userCollection.insertOne(jelloProjectsSchema(projectId, name, team, []));
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage
        };

        res.status(code).send(data);
    });

    router.get('/project', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        let projectId = req.body.project_id;
        let projectFound = null;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        const projectCollection = await client.db(dbName).collection("jello_projects");
        const project = await projectCollection.find({ "project_id": projectId }).toArray();

        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed"
        } else if (!projectId) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner l'id du project"
        } else if (project.length == 0) {
            success = false;
            code = 400;
            errorMessage = "Ce project existe pas";
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY || "testENCODE") ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            projectFound = project[0];
        }


        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage,
            "response": projectFound
        };

        res.status(code).send(data);
    });

    router.put("/project/delete/user", async (req, res) => {

        let newTeam = [];

        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        let projectId = req.body.project_id;
        let userId = req.body.user_id;
        let projectFound = null;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        const projectCollection = await client.db(dbName).collection("jello_projects");
        const project = await projectCollection.find({ "project_id": projectId }).toArray();

        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed"
        } else if (!projectId) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner l'id du project"
        } else if (!userId) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner l'id du utilisateur"
        } else if (project.length == 0) {
            success = false;
            code = 400;
            errorMessage = "Ce project existe pas";
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY || "testENCODE") ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            projectTeam = project[0].team;
            projectTeam.forEach(user => {
                if (user.user_id != userId) {
                    newTeam.append(user)
                }
            });
            if (newTeam.length == 0) {
                try {
                    await client.db(dbName).collection("jello_projects").deleteOne({ "project_id": projectId })
                } catch (err) {
                    success = false;
                    code = 400;
                    errorMessage = "An error has occured";
                }
            } else {
                try {
                    await client.db(dbName).collection("jello_projects").updateOne({ "project_id": projectId }, { $set: { "team": newTeam } })
                } catch (err) {
                    success = false;
                    code = 400;
                    errorMessage = "An error has occured";
                }
            }
        }


    });

    router.put("/project/add/user", async (req, res) => {
        let team = [];

        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        let projectId = req.body.project_id;
        let userId = req.body.user_id;
        let projectFound = null;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        const projectCollection = await client.db(dbName).collection("jello_projects");
        const userCollection = await client.db(dbName).collection("jello_users");
        const project = await projectCollection.find({ "project_id": projectId }).toArray();
        const user = await projectCollection.find({ "user_id": userId }).toArray();


        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed"
        } else if (!projectId) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner l'id du project"
        } else if (!userId) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner l'id du utilisateur"
        } else if (project.length == 0) {
            success = false;
            code = 400;
            errorMessage = "Ce project existe pas";
        } else if (user.length == 0) {
            success = false;
            code = 400;
            errorMessage = "Cet utilisateur n'existe pas";
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY || "testENCODE") ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            team = project[0].team;
            team.append(user[0]);
            try {
                await client.db(dbName).collection("jello_projects").updateOne({ "project_id": projectId }, { $set: { "team": team } })
            } catch (err) {
                success = false;
                code = 400;
                errorMessage = "An error has occured";
            }
        }
        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage
        };

        res.status(code).send(data);

    });

    router.get('/tasks', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        let projectId = req.body.project_id;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        const projectCollection = await client.db(dbName).collection("jello_projects");
        const project = await projectCollection.find({ "project_id": projectId }).toArray();

        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed";
        } else if (project.length == 0) {
            success = false;
            code = 400;
            errorMessage = "Ce project n'existe pas";
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY || "testENCODE") ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            response = project[0].tasks;
        }


        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage,
            "response": response
        };

        res.status(code).send(data);
    });

    router.get('/task', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        let taskId = req.body.task_id;
        let taskFound = null;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        const taskCollection = await client.db(dbName).collection("jello_tasks");
        const task = await taskCollection.find({ "task_id": taskId }).toArray();

        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed"
        } else if (!projectId) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner l'id de la tache"
        } else if (project.length == 0) {
            success = false;
            code = 400;
            errorMessage = "Cette tache n'existe pas";
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY || "testENCODE") ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            taskFound = task[0];
        }


        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage,
            "response": taskFound
        };

        res.status(code).send(data);
    });

    router.post('/task', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        let taskId = req.body.task_id;
        let name = req.body.name;
        let team = req.body.team;
        let status = req.body.status;
        let description = req.body.description;
        let projectId = req.body.project_id;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        const tasksCollection = await client.db(dbName).collection("jello_tasks");
        const projectCollection = await client.db(dbName).collection("jello_projects");
        const task = await projectCollection.find({ "task_id": taskId }).toArray();
        const project = await projectCollection.find({ "project_id": projectId }).toArray();


        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed"
        } else if (!taskId || !name) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner toutes les informations relatives a la tache"
        } else if (project.length == 0) {
            success = false;
            code = 400;
            errorMessage = "Ce project n'existe pas";
        } else if (task.length > 0) {
            success = false;
            code = 400;
            errorMessage = "Cette tache existe deja";
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY || "testENCODE") ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            await tasksCollection.insertOne(jelloTasksSchema(taskId, name, team, status, description, []));

            let tasks = project[0].tasks;
            let taskToProject = {
                "task_id": taskId,
                "name": name,
                "status": status
            }
            tasks.append(taskToProject);

            await projectCollection.updateOne({ "project_id": projectId }, { $set: { "tasks": tasks } })
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage
        };

        res.status(code).send(data);
    });

    router.get('/task/activity', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        let taskId = req.body.task_id;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        const tasksCollection = await client.db(dbName).collection("jello_tasks");
        const task = await projectCollection.find({ "task_id": taskId }).toArray();

        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed"
        } else if (!taskId) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner l'id de la tache"
        } else if (task.length == 0) {
            success = false;
            code = 400;
            errorMessage = "Cette tache n'existe pas";
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY || "testENCODE") ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            response = task[0].comments;
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage,
            "response": response
        };

        res.status(code).send(data);
    });

    router.post('/task/activity', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        let taskId = req.body.task_id;
        let dateTime = req.body.date_time;
        let message = req.body.message;
        let short = req.body.short;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        const tasksCollection = await client.db(dbName).collection("jello_tasks");
        const task = await projectCollection.find({ "task_id": taskId }).toArray();

        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed"
        } else if (!taskId) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner l'id de la tache"
        } else if (task.length == 0) {
            success = false;
            code = 400;
            errorMessage = "Cette tache n'existe pas";
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY || "testENCODE") ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            let comms = task[0].comments;

            comms.append(
                {
                    "date_time": dateTime,
                    "message": message,
                    "short": short
                }
            )

            await tasksCollection.updateOne({ "task_id": taskId }, { $set: { "comments": comms } });
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage
        };

        res.status(code).send(data);
    });

    router.put('/task/delete/user', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        let taskId = req.body.task_id;
        let userId = req.body.user_id;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        const tasksCollection = await client.db(dbName).collection("jello_tasks");
        const task = await projectCollection.find({ "task_id": taskId }).toArray();

        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed"
        } else if (!taskId) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner l'id de la tache"
        } else if (!userId) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner l'id de l'utilisateur"
        } else if (task.length == 0) {
            success = false;
            code = 400;
            errorMessage = "Cette tache n'existe pas";
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY || "testENCODE") ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            let team = task[0].team;
            let newTeam = [];

            team.foreach(user => {
                if (user.user_id != userId) {
                    newTeam.append(user);
                }
            });

            if (newTeam.length == 0) {
                await taskCollection.deleteOne({ "task_id": taskId });
            } else {
                await taskCollection.updateOne({ "task_id": taskId }, { $set: { "team": newTeam } });
            }
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage
        };

        res.status(code).send(data);

    });

    router.put('/task/add/user', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        let taskId = req.body.task_id;
        let userId = req.body.user_id;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        const tasksCollection = await client.db(dbName).collection("jello_tasks");
        const userCollection = await client.db(dbName).collection("jello_users");
        const task = await projectCollection.find({ "task_id": taskId }).toArray();
        const user = await projectCollection.find({ "user_id": userId }).toArray();

        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed"
        } else if (!taskId) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner l'id de la tache"
        } else if (!userId) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner l'id de l'utilisateur"
        } else if (task.length == 0) {
            success = false;
            code = 400;
            errorMessage = "Cette tache n'existe pas";
        } else if (user.length == 0) {
            success = false;
            code = 400;
            errorMessage = "Cet utilisateur n'existe pas";
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY || "testENCODE") ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            let team = task[0].team;

            team.append(user[0]);

            await taskCollection.updateOne({ "task_id": taskId }, { $set: { "team": team } });
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage
        };

        res.status(code).send(data);
    });

    router.put('/task/project/name', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        let projectId = req.body.projectId;
        let newName = req.body.new_name;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        const projectCollection = await client.db(dbName).collection("jello_projects");
        const project = await projectCollection.find({ "project_id": projectId }).toArray();

        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed"
        } else if (!projectId) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner l'id du project"
        } else if (!newName) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner le nouveau nom"
        } else if (project.length == 0) {
            success = false;
            code = 400;
            errorMessage = "Ce project n'existe pas";
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY || "testENCODE") ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            await projectCollection.updateOne({ "project_id": projectId }, { $set: { "name": newName } });
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage
        };

        res.status(code).send(data);
    });
})();


module.exports = router;


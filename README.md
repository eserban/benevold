# ROUTES

/api/admin - route to admin flutter app api

POST - /api/admin/add -> Body json {"email": "your_email", "password": "your_password"} --
        Return if success : {
            "success": true,
            "requestCode": 200,
            "error": null
        }

        Return if error: {
            "success": false,
            "requestCode": 400,
            "error": "Le mot de passe doit contenir au moins 4 catactères."
        }




POST - /api/admin/signin -> Body json {"email": "your_email", "password": "your_password"} --
        Return if success : {
                                "success": true,
                                "requestCode": 200,
                                "error": null,
                                "token": "24_hours_valid_token"
                            }

        Return if error: {
                                "success": false,
                                "requestCode": 400,
                                "error": "Le mot de passe doit contenir au moins 4 catactères."
                            }
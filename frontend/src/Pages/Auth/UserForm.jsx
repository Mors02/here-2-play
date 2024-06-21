import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { TextField, Stack, Button } from "@mui/material";

function UserForm({title, onSubmit, isEdit, user}) {
    const [changePassword, setChangePassword] = useState(false)
    const {
        register,
        formState: {errors},
        getValues,
        setValue
    } = useForm()

    useEffect(() => {
        if (user) {
            setValue("username", user.username);
            setValue("email", user.email);
            setValue("first_name", user.first_name);
            setValue("last_name", user.last_name);
        }
    }, [])


    return(<Stack direction="column">
        <h2>{title}</h2>
        <form onSubmit={(e) => onSubmit(e, getValues())}>
            <p>
                <TextField label="Username" type="text" defaultValue="" {...register("username")} variant="standard" />
            </p>
            <p>
                <TextField label="Email" type="email" defaultValue="" {...register("email")} variant="standard" />
            </p>
            {!isEdit?
                <div>
                    <p>
                        <TextField label="Password" type="password" defaultValue="" {...register("password")} variant="standard" />
                    </p>
                    <p>
                        <TextField label="Conferma Password" type="password" defaultValue="" {...register("confirmPassword")} variant="standard" />
                    </p>
                </div> : 
                <div>
                    <p>
                        <TextField label="Nome" defaultValue="" {...register("first_name")} variant="standard" />
                    </p>
                    <p>
                        <TextField label="Cognome" defaultValue="" {...register("last_name")} variant="standard" />
                    </p>
                    {changePassword?
                        <>
                            <p>
                                <TextField label="Vecchia Password" type="password" defaultValue="" {...register("oldPassword")} variant="standard" />
                            </p>
                            <p>
                                <TextField label="Nuova Password" type="password" defaultValue="" {...register("newPassword")} variant="standard" />
                            </p>
                            <p>
                                <TextField label="Conferma nuova Password" type="password" defaultValue="" {...register("confirmNewPassword")} variant="standard" />
                            </p>
                        </> : <></>
                    }            
                </div>}
            <p>
                {isEdit? <Button sx={{margin: "15px", display: "inline"}} onClick={() => setChangePassword(!changePassword)} variant="contained" color="warning">Cambia password</Button> : <></>}
                <Button sx={{display: "inline"}} onClick={(e) => {console.log(getValues()); onSubmit(e, getValues())}} variant="contained" color="info">Registrati</Button>
            </p>
        </form>
        
    </Stack>
    )
}

export default UserForm
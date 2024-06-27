import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { TextField, Stack, Button, Box, Typography } from "@mui/material";
import { FiCamera } from "react-icons/fi";
import ReactFileReader from "react-file-reader";

function UserForm({title, onSubmit, isEdit, user, pfp}) {
    const [changePassword, setChangePassword] = useState(false)
    const [imageData, setImageData] = useState(process.env.REACT_APP_BASE_URL + pfp)
    const [url, setUrl] = useState()
    const [show, setShow] = useState(false)
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

    function handleSubmit(e) {
        setValue("profile_picture", url);
        console.log(getValues())
        onSubmit(e, getValues())
    }
    
    function handleFiles(files) {
        console.log(files.fileList[0])
        setUrl(files.fileList[0])
        setImageData(files.base64)
    }

    return(
    <Stack direction="column" className="w-full">
        <Typography>{title}</Typography>
        <form onSubmit={(e) => onSubmit(e, getValues())}>
            <Stack direction={"row"} >
                <Box className="mr-10">
                    <p>
                        <TextField label="Username" type="text" defaultValue="" {...register("username")} variant="standard" />
                    </p>
                    <p>
                        <TextField label="Email" type="email" defaultValue="" {...register("email")} variant="standard" />
                    </p>
                    {!isEdit?
                    
                        <Box>
                            <p>
                                <TextField label="Password" type="password" defaultValue="" {...register("password")} variant="standard" />
                            </p>
                            <p>
                                <TextField label="Conferma Password" type="password" defaultValue="" {...register("confirmPassword")} variant="standard" />
                            </p>
                        </Box> : 
                        <Stack direction={"column"}>
                            <Box>
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
                            </Box>           
                        </Stack>}
                </Box>
                {isEdit && <Box className="pb-10 relative ml-20 cursor-pointer" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
                    <ReactFileReader
                        fileTypes={[".png", ".jpg"]}
                        base64={true}
                        handleFiles={handleFiles}
                    >
                        <img className="object-cover w-64 h-64 rounded-full inline " src={imageData} />
                        {<FiCamera className={show? "absolute bottom-1/2 left-1/2 w-24 h-24 transform -translate-x-1/2 translate-y-[33%] opacity-50 transition ease-linear" : "absolute bottom-1/2 left-1/2 w-24 h-24 transform -translate-x-1/2 opacity-0 transition ease-linear"}/>}
                    </ReactFileReader>
                </Box>}
            </Stack>
            <Box>
                {isEdit? <Button sx={{margin: "15px", display: "inline"}} onClick={() => setChangePassword(!changePassword)} variant="contained" color="warning">Cambia password</Button> : <></>}
                <Button sx={{display: "inline"}} onClick={(e) => { handleSubmit(e) }} variant="contained" color="info">Registrati</Button>
            </Box>
        </form>
        
    </Stack>
    )
}

export default UserForm
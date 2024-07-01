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

    const inputStyle = "bg-gray-200 rounded"

    return(
        <Stack spacing={2}>
            <Box className="px-8 py-4 bg-slate-500">
                <Typography variant="h5" className="text-center font-semibold text-white">{title}</Typography>
            </Box>

            <Box className="px-8 py-4">
                <form onSubmit={(e) => onSubmit(e, getValues())}>
                    <Stack spacing={2}>
                        {
                            isEdit && (
                                <Box className="flex justify-center !-mt-4">
                                    <Box className="w-fit relative cursor-pointer" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
                                        <ReactFileReader
                                            fileTypes={[".png", ".jpg"]}
                                            base64={true}
                                            handleFiles={handleFiles}
                                        >
                                            <img className="object-cover w-32 h-32 rounded-full inline" src={imageData} />
                                            <FiCamera className={show ? "absolute bottom-1/2 left-1/2 w-12 h-12 transform -translate-x-1/2 translate-y-[50%] opacity-50 transition ease-linear" : "absolute bottom-1/2 left-1/2 w-12 h-12 transform -translate-x-1/2 opacity-0 transition ease-linear"}/>
                                        </ReactFileReader>
                                    </Box>     
                                </Box>
                            )
                        }
                        <TextField className={inputStyle} label="Username" type="text" defaultValue="" {...register("username")} variant="outlined" />
                        <TextField className={inputStyle} label="Email" type="email" defaultValue="" {...register("email")} variant="outlined" />
                        {
                            !isEdit ? (
                                <Box className="flex gap-4">
                                    <TextField className={inputStyle} label="Password" type="password" defaultValue="" {...register("password")} variant="outlined" />
                                    <TextField className={inputStyle} label="Conferma Password" type="password" defaultValue="" {...register("confirmPassword")} variant="outlined" />
                                </Box>
                            )
                            : (
                                <Stack spacing={2}>
                                    <Box className="flex gap-4">
                                        <TextField className={inputStyle} label="Nome" defaultValue="" {...register("first_name")} variant="outlined" />
                                        <TextField className={inputStyle} label="Cognome" defaultValue="" {...register("last_name")} variant="outlined" />
                                    </Box>

                                    {
                                        changePassword && (
                                            <Stack spacing={2}>
                                                <TextField className={inputStyle} label="Vecchia Password" type="password" defaultValue="" {...register("oldPassword")} variant="outlined" />
                                                <TextField className={inputStyle} label="Nuova Password" type="password" defaultValue="" {...register("newPassword")} variant="outlined" />
                                                <TextField className={inputStyle} label="Conferma nuova Password" type="password" defaultValue="" {...register("confirmNewPassword")} variant="outlined" />
                                            </Stack>   
                                        )
                                    } 
                                </Stack>
                            )
                        }
                    </Stack>

                    <Box className={"!mt-4 grid " + (isEdit ? 'grid-cols-2 gap-4' : '')}>
                        { isEdit && <Button onClick={() => setChangePassword(!changePassword)} variant="contained" color="warning">Cambia password</Button> }
                        <Button className="w-full" onClick={(e) => { handleSubmit(e) }} variant="contained" color="info">{ isEdit ? 'Modifica' : 'Registrati' }</Button>
                    </Box>
                </form>
            </Box>
        </Stack>
    )
}

export default UserForm